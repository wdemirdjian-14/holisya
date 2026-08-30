module.exports = {
  apps: [
    {
      name: 'holisya',
      cwd: __dirname,
      script: 'node_modules/.bin/next',
      args: 'start -p 3003',
      env: {
        NODE_ENV: 'production',
        TZ: 'Europe/Paris',
      },
    },
  ],
};
