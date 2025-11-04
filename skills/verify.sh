#!/bin/bash
# skills/verify.sh
# 품질 게이트 일괄 검증

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# setup.sh 실행
echo "🔧 설정 확인 중..."
bash "$SCRIPT_DIR/setup.sh"

# .runner 파일에서 러너 읽기
if [ ! -f ".runner" ]; then
    echo "❌ .runner 파일을 찾을 수 없습니다. setup.sh를 먼저 실행하세요."
    exit 1
fi

RUNNER=$(cat .runner)

# 각 검증 단계 실행
echo ""
echo "📋 품질 게이트 검증 시작..."
echo ""

FAILED=0

# 1. 포맷
echo "1️⃣  포맷 검사..."
if ! bash "$SCRIPT_DIR/fmt.sh" --check; then
    echo "❌ 포맷 검사 실패"
    FAILED=1
else
    echo "✅ 포맷 검사 통과"
fi

# 2. 린트
echo ""
echo "2️⃣  린트 검사..."
if ! bash "$SCRIPT_DIR/lint.sh"; then
    echo "❌ 린트 검사 실패"
    FAILED=1
else
    echo "✅ 린트 검사 통과"
fi

# 3. 타입 체크
echo ""
echo "3️⃣  타입 검사..."
if ! bash "$SCRIPT_DIR/typecheck.sh"; then
    echo "❌ 타입 검사 실패"
    FAILED=1
else
    echo "✅ 타입 검사 통과"
fi

# 4. 테스트
echo ""
echo "4️⃣  테스트 실행..."
if ! bash "$SCRIPT_DIR/test.sh"; then
    echo "❌ 테스트 실패"
    FAILED=1
else
    echo "✅ 테스트 통과"
fi

# 5. 빌드
echo ""
echo "5️⃣  빌드 검사..."
if ! bash "$SCRIPT_DIR/build.sh"; then
    echo "❌ 빌드 실패"
    FAILED=1
else
    echo "✅ 빌드 통과"
fi

echo ""
if [ $FAILED -eq 1 ]; then
    echo "❌ 품질 게이트 검증 실패"
    exit 1
else
    echo "✅ 모든 품질 게이트 통과"
    exit 0
fi
