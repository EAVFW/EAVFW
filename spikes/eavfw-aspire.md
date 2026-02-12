apphost.cs
using EAVFramework;
using EAVFramework.Extensions.Aspire.Hosting;
using EAVFramework.Extensions.Aspire.Hosting.Database;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Aspire.Hosting;
using Aspire.Hosting.ApplicationModel;
using SCL.Models;
using Projects;

var builder = DistributedApplication.CreateBuilder(args);
builder.Configuration.AddUserSecrets<SCL_AppHost>();

var environmentName = builder.Environment.EnvironmentName;
var prefix = "scl";

var sqlPass = builder.AddParameter("sql-server-password", "Your_strong_password123!",secret:true);
// Add SQL Server resource for WSL compatibility
var sqlServerBuilder = builder
.AddSqlServer("sqlserver", sqlPass)
.WithDataVolume($"{prefix}-sql-am") // Persists data between container restarts
.WithLifetime(ContainerLifetime.Persistent); // Keep container running across app restarts

var sqlServer = sqlServerBuilder
.WithRestoreBacpacCommand(
defaultDatabaseName: "sql-db"
);

sqlServer.WithDbGate(dbgate => dbgate.WithParentRelationship(sqlServer)); // Adds DbGate web-based database administration tool

// Add a database to the SQL Server instance
var db = sqlServer
.AddDatabase("sql-db");

// ==================== EMULATORS ====================
//var bcEmulator = builder.AddBCEmulator<Projects.BCEmulator>("bc-emulator")
// .WithMetadataFolder(Path.GetFullPath("../../emulators/bc-emulator/metadata"));

//var netsEmulator = builder.AddNetsEmulator<Projects.NetsEmulator>("nets-emulator");

//var wcEmulator = builder.AddWCEmulator<Projects.WCEmulator>("wc-emulator")
// .WithNetsEasyCheckout(netsEmulator)
// .WithProductCatalog(Path.GetFullPath("../../emulators/wc-emulator/metadata"));

//var frmEmulator = builder.AddFrmEmulator<Projects.FrmEmulator>("frm-emulator")
// .WithWCEmulator(wcEmulator)
// .WithEventConfig(Path.GetFullPath("../../emulators/frm-emulator/metadata"));

// ==================== APPLICATION SERVICES ====================
var portal = builder
.AddEAVFWApp<Projects.SCL_Portal>("maas-portal", "build-app",
builder.Configuration.GetValue<string>("Aspire_LaunchProfile") ?? "https")
.WithEnvironment("ASPNETCORE_ENVIRONMENT", environmentName)
.WithEnvironment("DOTNET_ENVIRONMENT", environmentName)
.WithEnvironment("APPLICATIONINSIGHTS_CONNECTION_STRING", builder.Configuration["APPLICATIONINSIGHTS_CONNECTION_STRING"] ?? "")

    // Forward all project-specific configuration from AppHost settings/secrets
    // Use SCL_Portal:* or SCL_Portal__* in appsettings.json or user secrets
    .ForwardEnvironmentVariables<Projects.SCL_Portal>()

    // Configure Mailpit (creates container and configures SMTP automatically)
    .WithMailPit()

    // Configure EAV Model with full setup (includes database reference)
    .WithEAVModel<Projects.SCL_Models, DynamicContext, Identity, Signin>(
        "maas-model",
        db,
        "pks@delegate.dk",
        Guid.Parse("1b714972-8d0a-4feb-b166-08d93c6ae329"),
        "Poul Kjeldager");

    // Configure emulators

// .WithBCEmulatorReference(bcEmulator)
// .WithNetsEmulatorReference(netsEmulator)
// .WithWCEmulatorReference(wcEmulator);

// WC emulator webhook subscriptions
//wcEmulator.AddWebhook(portal, "order.created", "order.updated", "product.created", "product.updated", "customer.created");

builder.Build().Run();

apphost.csproj
<Project Sdk="Aspire.AppHost.Sdk/13.1.0">

  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net10.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <UserSecretsId>db84a336-d0ba-4fb5-8f6c-208ab7ab245b</UserSecretsId>
  </PropertyGroup>

    <ItemGroup>

        <PackageReference Include="Aspire.Hosting.SqlServer" Version="13.1.0" />
        <PackageReference Include="CommunityToolkit.Aspire.Hosting.SqlServer.Extensions" Version="13.1.1" />
        <PackageReference Include="Microsoft.SqlServer.DacFx" Version="170.2.70" />

        <ProjectReference IsAspireProjectResource="False" Include="..\..\external\eavframework\aspire\EAVFramework.Extensions.Aspire.Hosting\EAVFramework.Extensions.Aspire.Hosting.csproj" />
        <ProjectReference IsAspireProjectResource="False" Include="..\..\src\SCL.Models\SCL.Models.csproj" />
        <ProjectReference Include="..\..\src\SCL.Models\SCL.Models.csproj" />
        <ProjectReference Include="..\SCL.Portal\SCL.Portal.csproj" />
        <ProjectReference IsAspireProjectResource="False" Include="..\..\emulators\bc-emulator\src\Aspire.Hosting.BCEmulator\Aspire.Hosting.BCEmulator.csproj" />
        <ProjectReference Include="..\..\emulators\bc-emulator\src\BCEmulator\BCEmulator.csproj" />
        <ProjectReference IsAspireProjectResource="False" Include="..\..\emulators\nets-emulator\src\Aspire.Hosting.NetsEmulator\Aspire.Hosting.NetsEmulator.csproj" />
        <ProjectReference Include="..\..\emulators\nets-emulator\src\NetsEmulator\NetsEmulator.csproj" />
        <ProjectReference IsAspireProjectResource="False" Include="..\..\emulators\wc-emulator\src\Aspire.Hosting.WCEmulator\Aspire.Hosting.WCEmulator.csproj" />
        <ProjectReference Include="..\..\emulators\wc-emulator\src\WCEmulator\WCEmulator.csproj" />
        <ProjectReference IsAspireProjectResource="False" Include="..\..\emulators\frm-emulator\src\Aspire.Hosting.FrmEmulator\Aspire.Hosting.FrmEmulator.csproj" />
        <ProjectReference Include="..\..\emulators\frm-emulator\src\FrmEmulator\FrmEmulator.csproj" />
    </ItemGroup>

</Project>

directory.build.props
<Project>
<PropertyGroup>
<LangVersion>12</LangVersion>
<EAVFrameworkVersion>5.0.0</EAVFrameworkVersion>
<UseEAVFromNuget>true</UseEAVFromNuget>
<LocalEAVFrameworkPath>..\..\..\EAVFramework</LocalEAVFrameworkPath>
<EmitCompilerGeneratedFiles>true</EmitCompilerGeneratedFiles>

 </PropertyGroup>
    <Import Project="secrets.props" Condition="Exists('secrets.props')" />
</Project>

C:\dev\scl\solution\apps\SCL.Portal\src\themes\default.ts
import { createTheme } from "@fluentui/react";
import { RegisterFeature } from "@eavfw/apps";
import { createV9Theme } from "@fluentui/react-migration-v8-v9";

const defaultTheme = createTheme({
semanticColors: {
actionLink: '#4a9c35'
},
palette: {
themePrimary: '#4a9c35',
themeLighterAlt: '#030602',
themeLighter: '#0c1908',
themeLight: '#162f10',
themeTertiary: '#2c5d20',
themeSecondary: '#41892f',
themeDarkAlt: '#57a543',
themeDark: '#6bb359',
themeDarker: '#8cc77e',
neutralLighterAlt: '#f1ece9',
neutralLighter: '#ede8e6',
neutralLight: '#e3dfdc',
neutralQuaternaryAlt: '#d3d0cd',
neutralQuaternary: '#cac6c4',
neutralTertiaryAlt: '#c2bebc',
neutralTertiary: '#a2afca',
neutralSecondary: '#5a6d95',
neutralPrimaryAlt: '#2a3c64',
neutralPrimary: '#094080',
neutralDark: '#14213c',
black: '#0f182c',
white: '#f8f3f0',
}
});

const topBarTheme = createTheme({
palette: {
themePrimary: '#ffffff',
themeLighterAlt: '#767676',
themeLighter: '#a6a6a6',
themeLight: '#c8c8c8',
themeTertiary: '#d0d0d0',
themeSecondary: '#dadada',
themeDarkAlt: '#eaeaea',
themeDark: '#f4f4f4',
themeDarker: '#f8f8f8',
neutralLighterAlt: '#203157',
neutralLighter: '#25375d',
neutralLight: '#2e4069',
neutralQuaternaryAlt: '#33466f',
neutralQuaternary: '#384c75',
neutralTertiaryAlt: '#50638c',
neutralTertiary: '#c8c8c8',
neutralSecondary: '#d0d0d0',
neutralPrimaryAlt: '#dadada',
neutralPrimary: '#ffffff',
neutralDark: '#f4f4f4',
black: '#f8f8f8',
white: '#094080',
}
});

export default defaultTheme;

RegisterFeature("defaultTheme", defaultTheme);
RegisterFeature("topBarTheme", topBarTheme);
RegisterFeature("defaultV2Theme", createV9Theme(defaultTheme));
RegisterFeature("topBarV2Theme", createV9Theme(topBarTheme));

C:\dev\scl\solution\apps\SCL.Portal\src\components\index.ts
import { RegisterFeature } from "@eavfw/apps";
import "./Ribbons";
export \* from "./CustomControlDemo";

RegisterFeature("WizardExpressionsProvider", (formValues: any) => {
console.log("WizardExpressionsProvider", [formValues]);

    return {

    }

});

RegisterFeature("ExpressionsProviderAsync", (formValues: any, expression: string) => {
console.log("ExpressionsProviderAsync", [formValues, expression]);
});

C:\dev\scl\solution\package.json

{
"name": "monorepo-typescript-next-the-sane-way",
"private": true,
"workspaces": [
"apps/SCL.Portal"
],
"scripts": {
"gm": "dotnet msbuild ./src/SCL.Models/SCL.Models.csproj /target:GenerateManifest",
"build": "npm run gm && npm run build-app && npm run build-api",
"build-app": "npm run clean --prefix apps/SCL.Portal && npm run build --prefix apps/SCL.Portal",
"build-api": "dotnet msbuild /property:Configuration=Release -v:Quiet -t:restore,build",
"run": "dotnet run --project apps/SCL.Portal",
"run-dev": "concurrently --kill-others \"env-cmd -f .env.app.local npm run start --prefix apps/SCL.Portal\"",
"blazor": "dotnet msbuild ./apps/SCL.Portal/SCL.Portal.csproj /target:CopyWebAssemblyToDist",
"open-sln": "start SCL.sln",
"mail-server-config": "dotnet user-secrets set --project ./apps/SCL.Portal \"Smtp:Port\" \"1025\" && dotnet user-secrets set --project ./apps/SCL.Portal \"Smtp:Host\" \"127.0.0.1\" && dotnet user-secrets set --project ./apps/SCL.Portal \"Smtp:EnableEmails\" \"true\"",
"mail-create": "docker run -p 8025:8025 -p 1025:1025 --name mailpit -d axllent/mailpit:latest",
"mail-rm": "docker stop mailpit && docker rm mailpit",
"mail-recreate": "npm run mail-rm && npm run mail-create",
"mail-setpassword": "dotnet user-secrets set --project ./apps/SCL.Portal \"SMTP:Password\"",
"set-user-secrets": "npm run mail-server-config && npm run db-connection-string",
"db-connection-string": "dotnet user-secrets set --project ./apps/SCL.Portal \"ConnectionStrings:ApplicationDB\" \"Server=127.0.0.1; Initial Catalog=scl; User ID=sa; Password=Bigs3cRet; TrustServerCertificate=true\"",
"db-recreate": "npm run db-rm && npm run db-create",
"db-start": "docker start SCL",
"db-stop": "docker stop SCL",
"db-rm": "npm run db-stop && docker rm SCL",
"db-docker": "docker run -v %cd%/obj/dbinit/:/opt/dbinit/ -e \"ACCEPT_EULA=Y\" -e \"SA_PASSWORD=Bigs3cRet\" -e \"MSSQL_PID=Express\" -p 1433:1433 --name SCL -d mcr.microsoft.com/mssql/server:2022-latest",
"db-initialize": "docker exec -it SCL /opt/mssql-tools18/bin/sqlcmd -C -S localhost -U sa -P Bigs3cRet -Q \"CREATE DATABASE scl;ALTER DATABASE scl SET RECOVERY SIMPLE;\"",
"db-setup": "npm run db-docker && npm run eavfw-gen-migrations",
"db-apply-setup": "npm run db-initialize && npm run eavfw-apply-migrations",
"db-create": "npm run gm && npm run db-setup && npm run db-apply-setup && npm run db-connection-string",
"eavfw-cleanup": "docker stop SCL && docker rm SCL",
"eavfw-nextjs": "dotnet new eavfw-nextjs --namespace \"SCL\" --appName \"Portal\" --allow-scripts yes",
"eavfw-ado": "dotnet new eavfw-ado --namespace \"SCL\" --appName \"Portal\" --allow-scripts yes",
"eavfw-add-ado-to-solution": "dotnet sln SCL.sln add ./build/ContinueIntegration.csproj",
"eavfw-add-ado": "npm run eavfw-ado && npm run eavfw-add-ado-to-solution",
"eavfw-link": "npm link @eavfw/apps @eavfw/next @eavfw/expressions @eavfw/manifest @eavfw/hooks @eavfw/forms @eavfw/utils",
"eavfw-gen-migrations": "dotnet tool run eavfw-manifest sql ./src/SCL.Models",
"eavfw-apply-migrations": "docker exec -i SCL /opt/mssql-tools18/bin/sqlcmd -C -s localhost -U sa -P Bigs3cRet -d scl -I -i /opt/dbinit/init.sql -i /opt/dbinit/init-systemadmin.sql -v DBName=scl -v DBSchema=dbo -v SystemAdminSecurityGroupId=1b714972-8d0a-4feb-b166-08d93c6ae328 -v UserGuid=1B5C1868-9B96-4816-8272-414BC9801355 -v UserName=\"Kristian Berlin\" -v UserEmail=kbj@delegate.dk -v UserPrincipalName=KristianBerlinJensen",
"eavfw-migrate": "npm run gm && npm run eavfw-gen-migrations && npm run eavfw-apply-migrations"
},
"dependencies": {
"@eavfw/apps": "1.4.0-vnext.56",
"@eavfw/codeeditor": "1.1.0-vnext.6",
"@eavfw/designer": "1.2.0",
"@eavfw/designer-core": "1.2.2",
"@eavfw/designer-nodes": "1.2.2",
"@eavfw/expressions": "1.2.0-vnext.2",
"@eavfw/forms": "1.2.0-vnext.9",
"@eavfw/hooks": "1.1.0-vnext.1",
"@eavfw/manifest": "1.5.0-vnext.23",
"@eavfw/next": "1.1.1-vnext.3",
"@eavfw/query": "1.0.0-vnext.6",
"@eavfw/quickform-core": "1.1.0-vnext.77",
"@eavfw/quickform-designer": "1.1.0-vnext.29",
"@eavfw/quickform-input-select": "1.0.1-vnext.9",
"@eavfw/quickform-querybuilder": "1.1.0-vnext.3",
"@eavfw/task-management": "1.0.0-vnext.4",
"@eavfw/utils": "1.1.0-vnext.4",
"@fluentui/font-icons-mdl2": "8.5.62",
"@fluentui/merge-styles": "8.6.14",
"@fluentui/react": "8.123.0",
"@fluentui/react-calendar-compat": "0.3.1",
"@fluentui/react-carousel-preview": "0.6.0",
"@fluentui/react-components": "9.66.3",
"@fluentui/react-datepicker-compat": "0.6.3",
"@fluentui/react-hooks": "8.8.19",
"@fluentui/react-migration-v0-v9": "9.4.3",
"@fluentui/react-migration-v8-v9": "9.8.3",
"@fluentui/react-nav-preview": "0.13.9",
"@fluentui/react-portal-compat": "9.2.3",
"@fluentui/theme": "2.6.67",
"@fluentui/utilities": "8.15.22",
"@rjsf/core": "5.18.4",
"@rjsf/fluentui-rc": "5.18.4",
"@rjsf/utils": "5.18.4",
"@rjsf/validator-ajv8": "5.18.4",
"@svgr/webpack": "8.1.0",
"clone-deep": "4.0.1",
"next": "14.0.3",
"react": "18.2.0",
"react-dom": "18.2.0"
},
"devDependencies": {
"@types/blazor\_\_javascript-interop": "3.1.7",
"@types/clone-deep": "4.0.1",
"@types/node": "17.0.45",
"@types/pako": "2.0.3",
"@types/react": "18.2.0",
"@types/react-dom": "18.2.0",
"@typescript-eslint/eslint-plugin": "4.30.0",
"@typescript-eslint/parser": "4.30.0",
"concurrently": "8.2.2",
"cross-env": "7.0.3",
"env-cmd": "10.1.0",
"next-transpile-modules": "10.0.1",
"prettier": "3.2.4",
"react-fast-compare": "3.2.0",
"rimraf": "^5.0.5",
"typescript": "5.4.2",
"webpack-preprocessor-loader": "1.1.4"
}
}
