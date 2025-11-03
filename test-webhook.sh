#!/bin/bash

# Webhook 배포 테스트 스크립트

echo "=== Jihoo Quest 배포 테스트 ==="
echo ""

# 1. Webhook 서버 health check
echo "1. Webhook 서버 상태 확인..."
HEALTH=$(curl -s http://localhost:8802/health 2>&1)
if echo "$HEALTH" | grep -q "ok"; then
  echo "✓ Webhook 서버 실행 중"
  echo "$HEALTH"
else
  echo "✗ Webhook 서버가 실행되지 않음"
  echo "  다음 명령어로 시작: pm2 start ecosystem.config.js --only jihoo-webhook"
  exit 1
fi

echo ""

# 2. 테스트 webhook 전송
echo "2. 테스트 webhook 전송..."
RESPONSE=$(curl -s -X POST http://localhost:8802/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "ref": "refs/heads/main",
    "repository": {
      "name": "jihoo-rebuild-game",
      "full_name": "ChangooLee/jihoo-rebuild-game"
    },
    "pusher": {
      "name": "test",
      "email": "test@example.com"
    },
    "head_commit": {
      "message": "Test deployment webhook"
    }
  }')

echo "$RESPONSE"

if echo "$RESPONSE" | grep -q "success"; then
  echo "✓ Webhook 수신 성공 - 배포가 시작됩니다"
else
  echo "✗ Webhook 전송 실패"
  exit 1
fi

echo ""
echo "3. 배포 로그 확인..."
echo "  tail -f logs/webhook-out.log 명령으로 실시간 로그를 확인하세요"
echo ""

# 4. PM2 상태 확인
echo "4. PM2 프로세스 상태..."
pm2 list 2>/dev/null || echo "  PM2가 설치되지 않았거나 프로세스가 없습니다"

echo ""
echo "=== 테스트 완료 ==="
echo ""
echo "GitHub Webhook 설정:"
echo "  URL: http://125.124.176.68:8802/webhook"
echo "  Content type: application/json"
echo "  Event: Just the push event"

