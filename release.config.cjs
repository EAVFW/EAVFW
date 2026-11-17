// Shared semantic-release settings. Each package runs semantic-release from its own folder and
// pulls this in with `-e ../../release.config.cjs`: cosmiconfig 9 (semantic-release >= 22) no
// longer searches parent folders, so a root .releaserc is not found from packages/*.
module.exports = {
  branches: [
    'main',
    { name: 'dev', prerelease: true },
    { name: 'dev-patch', prerelease: true },
  ],
};
