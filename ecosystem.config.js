// PM2 설정 파일
module.exports = {
  apps: [
    {
      name: 'jihoo-quest',
      script: 'apps/web/.next/standalone/server.js',
      cwd: '/home/lchangoo/Workspace/jihoo-rebuild-game',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_PUBLIC_BASE_PATH: '/jihoo',
        HOSTNAME: '0.0.0.0'
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
    {
      name: 'jihoo-webhook',
      script: 'webhook-server.js',
      cwd: '/home/lchangoo/Workspace/jihoo-rebuild-game',
      instances: 1,
      exec_mode: 'fork',
      env: {
        PORT: 8802,
        WEBHOOK_SECRET: process.env.WEBHOOK_SECRET || 'your-secret-key'
      },
      error_file: './logs/webhook-err.log',
      out_file: './logs/webhook-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      autorestart: true,
      watch: false,
    }
  ]
};

