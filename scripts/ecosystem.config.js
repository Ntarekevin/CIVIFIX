module.exports = {
  apps: [
    {
      name: 'civifix-api',
      script: 'server.js',
      cwd: '/var/www/civifix/backend',
      instances: 'max', // Use all CPUs
      exec_mode: 'cluster',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
        // Other sensitive variables like DB_PASSWORD, JWT_SECRET
        // should be loaded via a localized .env file or passed in PM2 arguments
      },
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      error_file: '/var/log/civifix/api-error.log',
      out_file: '/var/log/civifix/api-out.log',
      merge_logs: true,
      time: true,
    },
  ],
};
