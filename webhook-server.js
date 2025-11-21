#!/usr/bin/env node

const http = require('http');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const PORT = 8802;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'your-secret-key';
const PROJECT_PATH = path.join(__dirname, 'apps', 'web');
const LOG_FILE = path.join(__dirname, 'webhook.log');

// 로그 함수 (콘솔 + 파일)
function log(message, isError = false) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  
  if (isError) {
    console.error(logMessage);
    fs.appendFileSync(LOG_FILE, `ERROR: ${logMessage}\n`);
  } else {
    console.log(logMessage);
    fs.appendFileSync(LOG_FILE, `${logMessage}\n`);
  }
}

function deploy() {
  log('🚀 배포 시작...');
  
  // 프로젝트 루트에서 git pull
  exec('cd ' + __dirname + ' && git pull', (error, stdout, stderr) => {
    if (error) {
      log(`❌ git pull 실패: ${error.message}`, true);
      return;
    }
    log('✅ git pull 완료');
    if (stdout) log(`출력: ${stdout.trim()}`);
    if (stderr) log(`경고: ${stderr.trim()}`, true);
    
    // 의존성 설치
    log('📦 npm install 시작...');
    const installCmd = `cd ${__dirname}/apps/web && npm install`;
    
    exec(installCmd, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        log(`❌ npm install 실패: ${error.message}`, true);
        if (stderr) log(`에러 출력: ${stderr.trim()}`, true);
        return;
      }
      log('✅ npm install 완료');
      
      // 빌드
      log('🔨 npm run build 시작...');
      const buildCmd = `cd ${__dirname}/apps/web && npm run build`;
      
      exec(buildCmd, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
        if (error) {
          log(`❌ 빌드 실패: ${error.message}`, true);
          if (stderr) log(`에러 출력: ${stderr.trim()}`, true);
          return;
        }
        log('✅ 빌드 완료');
        if (stdout) {
          const lines = stdout.trim().split('\n');
          lines.slice(-10).forEach(line => log(`빌드: ${line}`));
        }
        
        // standalone 빌드 확인
        const standalonePath = path.join(__dirname, 'apps/web/.next/standalone');
        if (!fs.existsSync(standalonePath)) {
          log('⚠️ .next/standalone 폴더가 없습니다. standalone 빌드가 실패했을 수 있습니다.', true);
        } else {
          log('✅ standalone 빌드 확인됨');
          
          // static/public 파일 복사
          const copyCmd = `cd ${__dirname}/apps/web && ` +
            `cp -r public .next/standalone/apps/web/ 2>/dev/null && ` +
            `cp -r .next/static .next/standalone/apps/web/.next/ 2>/dev/null || true`;
          
          exec(copyCmd, (copyError, copyStdout, copyStderr) => {
            if (copyError) {
              log(`⚠️ 파일 복사 경고: ${copyError.message}`, true);
            } else {
              log('✅ static 파일 복사 완료');
            }
          });
        }
        
        // PM2 재시작 시도 (실패해도 계속 진행)
        log('🔄 PM2 재시작 시도...');
        exec('pm2 restart jihoo-quest 2>&1', (err, pmStdout, pmStderr) => {
          if (err) {
            log(`⚠️ PM2 재시작 실패 (PM2가 없거나 앱이 등록되지 않음): ${err.message}`, true);
            log('💡 PM2 없이도 빌드는 완료되었습니다. 수동으로 서버를 재시작하세요.');
          } else {
            log('✅ PM2 재시작 완료');
            if (pmStdout) log(`PM2 출력: ${pmStdout.trim()}`);
          }
          log('🎉 배포 프로세스 완료');
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
        
        log(`📥 웹훅 수신: ${payload.ref || 'unknown'}`);
        
        // main 브랜치 푸시만 배포
        if (payload.ref === 'refs/heads/main' || payload.ref === 'refs/heads/master') {
          deploy();
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'success', message: '배포 시작됨' }));
        } else {
          log(`⏭️ 배포 건너뜀: ${payload.ref} (main 브랜치가 아님)`);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'ignored', message: 'main 브랜치가 아님' }));
        }
      } catch (error) {
        log(`❌ 웹훅 파싱 오류: ${error.message}`, true);
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

const WEBHOOK_HOST = '125.240.175.68';

server.listen(PORT, '0.0.0.0', () => {
  log(`🚀 웹훅 서버 시작: http://0.0.0.0:${PORT}`);
  log(`📡 웹훅 엔드포인트: POST http://${WEBHOOK_HOST}:${PORT}/webhook`);
  log(`📡 웹훅 엔드포인트 (HTTPS): POST https://moba-project.org/webhook`);
  log(`📝 로그 파일: ${LOG_FILE}`);
});

