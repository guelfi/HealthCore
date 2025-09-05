module.exports = {
  apps: [
    {
      name: 'api',
      script: 'dotnet',
      args: 'run --project src/Api',
      cwd: 'src/Api',
      watch: ['src/Api'],
      ignore_watch: ['node_modules'],
      env: {
        ASPNETCORE_ENVIRONMENT: 'Development'
      }
    },
    {
      name: 'frontend',
      script: 'npm',
      args: 'run dev',
      cwd: 'src/Web',
      watch: ['src/Web'],
      ignore_watch: ['node_modules'],
      env: {
        NODE_ENV: 'development'
      }
    }
  ]
};