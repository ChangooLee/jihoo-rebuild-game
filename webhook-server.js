#!/usr/bin/env node

const http = require('http');
const { exec } = require('child_process');
const path = require('path');

const PORT = 8802;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'your-secret-key';
const PROJECT_PATH = path.join(__dirname, 'apps', 'web');

function deploy() {
  console.log(`[${new Date().toISOString()}] 배포 시작...`);
  
  // 프로젝트 루트에서 git pull
  exec('cd ' + __dirname + ' && git pull', (error, stdout, stderr) => {
    if (error) {
      console.error(`[${new Date().toISOString()}] git pull 실패:`, error);
      return;
    }
    console.log(`[${new Date().toISOString()}] git pull 완료`);
    console.log(stdout);
    if (stderr) console.error(stderr);
    
    // 의존성 설치 및 빌드 (npm 사용)
    const buildCmd = `cd ${__dirname}/apps/web && npm install && npm run build`;
    console.log(`[${new Date().toISOString()}] 빌드 명령: ${buildCmd}`);
    
    exec(buildCmd, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        console.error(`[${new Date().toISOString()}] 빌드 실패:`, error);
        console.error(stderr);
        return;
      }
      console.log(`[${new Date().toISOString()}] 빌드 완료`);
      console.log(stdout);
      if (stderr) console.error(stderr);
      
      // standalone 빌드 후 static/public 파일 복사
      const copyCmd = `cd ${__dirname}/apps/web && ` +
        `cp -r public .next/standalone/apps/web/ && ` +
        `cp -r .next/static .next/standalone/apps/web/.next/`;
      
      exec(copyCmd, (copyError, copyStdout, copyStderr) => {
        if (copyError) {
          console.error(`[${new Date().toISOString()}] 파일 복사 실패:`, copyError);
        } else {
          console.log(`[${new Date().toISOString()}] static 파일 복사 완료`);
        }
        
        // PM2로 재시작
        exec('pm2 restart jihoo-quest', (err, pmStdout, pmStderr) => {
          if (err) {
            console.error(`[${new Date().toISOString()}] PM2 재시작 실패:`, err);
            console.error(pmStderr);
          } else {
            console.log(`[${new Date().toISOString()}] PM2 재시작 완료`);
            console.log(pmStdout);
          }
        });
      });
    });
  });
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/webhook') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        
        // GitHub webhook signature 검증 (선택사항)
        // 실제 사용 시 X-Hub-Signature-256 헤더로 검증 권장
        
        console.log(`[${new Date().toISOString()}] 웹훅 수신:`, payload.ref || 'unknown');
        
        // main 브랜치 푸시만 배포
        if (payload.ref === 'refs/heads/main' || payload.ref === 'refs/heads/master') {
          deploy();
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'success', message: '배포 시작됨' }));
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'ignored', message: 'main 브랜치가 아님' }));
        }
      } catch (error) {
        console.error(`[${new Date().toISOString()}] 웹훅 파싱 오류:`, error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'error', message: error.message }));
      }
    });
  } else if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', port: PORT }));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'not found' }));
  }
});

const WEBHOOK_HOST = '125.124.176.68';

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[${new Date().toISOString()}] 웹훅 서버 시작: http://0.0.0.0:${PORT}`);
  console.log(`웹훅 엔드포인트: POST http://${WEBHOOK_HOST}:${PORT}/webhook`);
  console.log(`웹훅 엔드포인트 (HTTPS): POST https://moba-project.org/webhook`);
});

