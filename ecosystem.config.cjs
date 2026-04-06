module.exports = {
  apps: [
    {
      name: 'reverse-ai',
      script: 'npx',
      args: 'next start -p 3002',
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
      },
      autorestart: true,
      max_memory_restart: '256M',
    },
  ],
};
