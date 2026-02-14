using System.Diagnostics;

namespace ScaffoldIntegrationTests;

[TestClass]
public class ScaffoldIntegrationTests
{
    private static readonly string RepoRoot = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", ".."));
    private static readonly string SamplesDir = Path.Combine(RepoRoot, "samples");
    private static readonly string ProjectDir = Path.Combine(SamplesDir, "TestCRM");
    private static readonly string TemplatesDir = Path.Combine(RepoRoot, "external", "eavfw-templates", "templates");

    private static (int exitCode, string stdout, string stderr) RunCommand(string exe, string args, string workingDir, int timeoutMs = 120_000)
    {
        var psi = new ProcessStartInfo
        {
            FileName = exe,
            Arguments = args,
            WorkingDirectory = workingDir,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            CreateNoWindow = true,
        };

        using var process = new Process { StartInfo = psi };
        var stdout = new System.Text.StringBuilder();
        var stderr = new System.Text.StringBuilder();

        process.OutputDataReceived += (_, e) =>
        {
            if (e.Data is not null)
            {
                stdout.AppendLine(e.Data);
                Console.WriteLine(e.Data);
            }
        };
        process.ErrorDataReceived += (_, e) =>
        {
            if (e.Data is not null)
            {
                stderr.AppendLine(e.Data);
                Console.Error.WriteLine(e.Data);
            }
        };

        process.Start();
        process.BeginOutputReadLine();
        process.BeginErrorReadLine();

        if (!process.WaitForExit(timeoutMs))
        {
            process.Kill(entireProcessTree: true);
            return (-1, stdout.ToString(), $"Process timed out after {timeoutMs}ms\n{stderr}");
        }

        return (process.ExitCode, stdout.ToString(), stderr.ToString());
    }

    [ClassInitialize]
    public static void ClassInitialize(TestContext context)
    {
        // Clean up from any previous run
        if (Directory.Exists(ProjectDir))
            Directory.Delete(ProjectDir, recursive: true);

        // Install templates from local source
        var eavfwTemplate = Path.Combine(TemplatesDir, "EAVFW");
        var nextjsTemplate = Path.Combine(TemplatesDir, "EAVFW.NextJS");

        var (exitCode, _, stdErr) = RunCommand("dotnet", $"new install {eavfwTemplate} --force", RepoRoot);
        Assert.AreEqual(0, exitCode, $"Failed to install EAVFW template: {stdErr}");

        (exitCode, _, stdErr) = RunCommand("dotnet", $"new install {nextjsTemplate} --force", RepoRoot);
        Assert.AreEqual(0, exitCode, $"Failed to install EAVFW.NextJS template: {stdErr}");

        // Create samples directory and scaffold project
        Directory.CreateDirectory(ProjectDir);

        (exitCode, _, stdErr) = RunCommand("dotnet",
            "new eavfw " +
            "--namespace TestCRM --appName Portal --databaseName TestCRM --schemaName dbo " +
            "--yourUserEmail admin@testcrm.dev --yourUserName Admin " +
            "--skipPortal --skipGitCommit --useLocalReferences --useNpmLink " +
            "--targetFramework net10.0 --allow-scripts yes",
            ProjectDir, timeoutMs: 300_000);
        Assert.AreEqual(0, exitCode, $"Failed to scaffold EAVFW project: {stdErr}");

        (exitCode, _, stdErr) = RunCommand("dotnet",
            "new eavfw-nextjs " +
            "--namespace TestCRM --appName Portal " +
            "--skipGitCommit --skipCertGen --allow-scripts yes",
            ProjectDir, timeoutMs: 300_000);
        Assert.AreEqual(0, exitCode, $"Failed to scaffold EAVFW NextJS project: {stdErr}");

        // Restore tools and build the test project
        (exitCode, _, stdErr) = RunCommand("dotnet", "tool restore --no-cache", ProjectDir, timeoutMs: 300_000);
        Assert.AreEqual(0, exitCode, $"Failed to restore dotnet tools: {stdErr}");

        var testProjectPath = Path.Combine(ProjectDir, "tests", "TestCRM.AppHost.Tests", "TestCRM.AppHost.Tests.csproj");

        // First build generates manifest.g.json via source generators; second build uses it
        (exitCode, _, stdErr) = RunCommand("dotnet", $"build {testProjectPath}", ProjectDir, timeoutMs: 300_000);
        if (exitCode != 0)
        {
            Console.WriteLine("First build failed (expected for manifest generation), retrying...");
            (exitCode, _, stdErr) = RunCommand("dotnet", $"build {testProjectPath}", ProjectDir, timeoutMs: 300_000);
        }
        Assert.AreEqual(0, exitCode, $"Failed to build test project: {stdErr}");
    }

    [TestMethod]
    [Timeout(300_000)] // 5 minutes
    public void ScaffoldAndRunSmokeTest()
    {
        var testProjectPath = Path.Combine(ProjectDir, "tests", "TestCRM.AppHost.Tests", "TestCRM.AppHost.Tests.csproj");

        var (exitCode, stdout, stderr) = RunCommand("dotnet",
            $"test {testProjectPath} --filter PlaywrightSmokeTest --no-build --logger \"console;verbosity=detailed\"",
            ProjectDir, timeoutMs: 300_000);

        Assert.AreEqual(0, exitCode, $"Smoke test failed.\nStdout:\n{stdout}\nStderr:\n{stderr}");

        var screenshotPath = Path.Combine(ProjectDir, "videos", "playwright-smoke.png");
        Assert.IsTrue(File.Exists(screenshotPath),
            $"Expected screenshot not found at {screenshotPath}");
    }

    [TestMethod]
    [Timeout(600_000)] // 10 minutes
    public void ScaffoldAndRunFullE2E()
    {
        var testProjectPath = Path.Combine(ProjectDir, "tests", "TestCRM.AppHost.Tests", "TestCRM.AppHost.Tests.csproj");

        var (exitCode, stdout, stderr) = RunCommand("dotnet",
            $"test {testProjectPath} --filter FullLoginFlow --no-build --logger \"console;verbosity=detailed\"",
            ProjectDir, timeoutMs: 600_000);

        Assert.AreEqual(0, exitCode, $"Full E2E test failed.\nStdout:\n{stdout}\nStderr:\n{stderr}");

        var videosDir = Path.Combine(ProjectDir, "videos");
        Assert.IsTrue(Directory.Exists(videosDir), $"Videos directory not found at {videosDir}");

        var videos = Directory.GetFiles(videosDir, "*.webm");
        Assert.IsTrue(videos.Length > 0, "No .webm video files found in videos directory");

        var screenshots = Directory.GetFiles(videosDir, "*.png");
        Assert.IsTrue(screenshots.Length > 0, "No .png screenshot files found in videos directory");
    }

    [ClassCleanup]
    public static void ClassCleanup()
    {
        // Keep scaffolded project on failure for inspection
        // Clean up manually with: rm -rf samples/TestCRM
    }
}
