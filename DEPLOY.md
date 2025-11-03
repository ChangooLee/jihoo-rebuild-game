# 배포 가이드

## 1. nginx 설정

nginx 설정 파일을 복사하고 활성화합니다:

```bash
# 설정 파일 복사 (기존 설정이 있다면 병합 필요)
sudo cp nginx-jihoo.conf /etc/nginx/sites-available/jihoo

# 심볼릭 링크 생성
sudo ln -s /etc/nginx/sites-available/jihoo /etc/nginx/sites-enabled/jihoo

# 또는 기존 설정 파일에 location 블록 추가
sudo nano /etc/nginx/sites-available/default  # 또는 해당 설정 파일
```

nginx 설정을 테스트하고 재시작:

```bash
sudo nginx -t
sudo systemctl reload nginx
# 또는
sudo service nginx reload
```

## 2. Next.js 앱 실행

### PM2 사용 (권장)

```bash
# PM2 설치 (없는 경우)
npm install -g pm2

# 앱 빌드
cd apps/web
pnpm build

# PM2로 앱 시작
cd ../..
pm2 start ecosystem.config.js

# 상태 확인
pm2 status
pm2 logs jihoo-quest
```

### 직접 실행

```bash
cd apps/web
pnpm build
NEXT_PUBLIC_BASE_PATH=/jihoo pnpm start
```

## 3. 웹훅 서버 실행

### PM2 사용 (권장)

PM2 설정 파일에 이미 포함되어 있습니다:

```bash
pm2 start ecosystem.config.js
# 또는 웹훅만 시작
pm2 start ecosystem.config.js --only jihoo-webhook
```

### 직접 실행

```bash
node webhook-server.js
# 또는 백그라운드 실행
nohup node webhook-server.js > logs/webhook.log 2>&1 &
```

## 4. GitHub Webhook 설정

GitHub 저장소에서 웹훅을 설정합니다:

1. GitHub 저장소 → Settings → Webhooks → Add webhook
2. Payload URL: `http://125.124.176.68:8802/webhook` 또는 `https://moba-project.org/webhook` (nginx를 통해 프록시하는 경우)
3. Content type: `application/json`
4. Secret: 환경변수 `WEBHOOK_SECRET`과 동일하게 설정
5. Events: `Just the push event` 선택 (또는 필요한 이벤트만)

## 5. 환경 변수 설정

`.env.production` 파일 생성 (선택사항):

```bash
cd apps/web
cat > .env.production << EOF
NEXT_PUBLIC_BASE_PATH=/jihoo
NODE_ENV=production
PORT=3000
EOF
```

웹훅 시크릿 설정:

```bash
export WEBHOOK_SECRET=your-secret-key-here
# 또는 PM2 환경변수로 설정
pm2 restart jihoo-webhook --update-env
```

## 6. 방화벽 설정

8802 포트가 열려있는지 확인:

```bash
sudo ufw allow 8802/tcp
# 또는
sudo iptables -A INPUT -p tcp --dport 8802 -j ACCEPT
```

## 7. 테스트

- 앱 접속: `https://moba-project.org/jihoo`
- 웹훅 건강 확인: `http://125.124.176.68:8802/health` 또는 `https://moba-project.org/webhook/health`
- GitHub에서 테스트 푸시를 보내 배포 확인

## 8. 로그 확인

```bash
# PM2 로그
pm2 logs jihoo-quest
pm2 logs jihoo-webhook

# 또는 직접 로그 파일 확인
tail -f logs/out.log
tail -f logs/webhook-out.log
```

