# Nginx 설정 가이드

## 문제 상황
moba-project.org/jihoo로 접속 시 기존 moba 페이지가 표시됨

## 해결 방법

### 1. 기존 moba 설정 파일 수정

기존 `/etc/nginx/sites-available/moba` 파일을 편집합니다:

```bash
sudo nano /etc/nginx/sites-available/moba
```

### 2. Jihoo 라우팅 추가

**HTTP (포트 80) server 블록**과 **HTTPS (포트 443) server 블록** 각각에 다음 location 블록들을 추가하세요.

**중요**: 다른 location 블록(특히 `location /` 같은 catch-all)보다 **위에** 배치해야 합니다.

```nginx
server {
    listen 80;  # 또는 443 ssl http2
    server_name moba-project.org;
    
    # ===== Jihoo Quest 라우팅 시작 =====
    location /jihoo/ {
        proxy_pass http://127.0.0.1:3000/jihoo/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Next.js를 위한 추가 헤더
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        
        # 타임아웃 설정
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Jihoo Quest 정적 파일 캐싱
    location ~ ^/jihoo/_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }

    # Jihoo 웹훅 엔드포인트
    location /webhook {
        proxy_pass http://127.0.0.1:8802;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    # ===== Jihoo Quest 라우팅 끝 =====
    
    # ... 기존 moba 설정 ...
    location / {
        # 기존 moba 라우팅
    }
}
```

### 3. 설정 검증 및 적용

```bash
# 설정 파일 문법 검사
sudo nginx -t

# 문제 없으면 nginx 재시작
sudo systemctl reload nginx
```

### 4. Jihoo Quest 앱 실행 (PM2)

```bash
cd /home/lchangoo/Workspace/jihoo-rebuild-game

# 빌드
cd apps/web && npm run build

# PM2로 시작
cd ../..
pm2 start ecosystem.config.js

# 상태 확인
pm2 status
pm2 logs jihoo-quest
```

### 5. 테스트

- Jihoo Quest: https://moba-project.org/jihoo
- 웹훅 health check: http://125.124.176.68:8802/health

## 주의사항

1. **location 블록 순서**: `/jihoo/` 블록은 반드시 `location /` 같은 catch-all보다 위에 있어야 합니다
2. **trailing slash**: `/jihoo/`로 끝에 슬래시를 붙여 정확히 매칭하도록 합니다
3. **기존 설정 보존**: moba 프로젝트의 기존 설정은 그대로 유지합니다

## 트러블슈팅

### 여전히 moba 페이지가 뜨는 경우

1. nginx 설정에서 location 블록 순서 확인
2. nginx 로그 확인: `sudo tail -f /var/log/nginx/access.log`
3. 브라우저 캐시 클리어 (Ctrl+Shift+R)
4. Next.js 앱이 실행 중인지 확인: `curl http://localhost:3000/jihoo`

### nginx 설정 확인 명령어

```bash
# 현재 적용된 설정 확인
sudo nginx -T | grep -A 30 "location /jihoo"

# nginx 에러 로그
sudo tail -f /var/log/nginx/error.log
```

