#!/usr/bin/env python3
"""
파라메트릭 수학 문제 생성기
mathgenerator를 사용하여 초5-6, 중1 수학 문항 대량 생성
"""

import json
import random
import hashlib
from pathlib import Path
from typing import List, Dict, Any

try:
    import mathgenerator
except ImportError:
    print("mathgenerator가 설치되지 않았습니다: pip install mathgenerator")
    exit(1)


# 학년별 문제 유형 매핑
PROBLEM_SETS = {
    "ES56": {
        "수와연산": [
            (0, "분수덧셈", ["분수연산"]),
            (1, "분수뺄셈", ["분수연산"]),
            (21, "분수곱셈", ["분수연산"]),
            (16, "소수덧셈", ["소수연산"]),
            (17, "소수뺄셈", ["소수연산"]),
            (18, "소수곱셈", ["소수연산"]),
        ],
        "측정": [
            (23, "원의둘레", ["원", "둘레"]),
            (24, "원의넓이", ["원", "넓이"]),
            (22, "삼각형넓이", ["삼각형", "넓이"]),
        ],
        "규칙성": [
            (6, "일차방정식", ["방정식"]),
            (11, "비례식", ["비", "비례"]),
        ],
        "자료와가능성": [
            (7, "평균", ["평균", "통계"]),
            (25, "확률", ["확률"]),
        ]
    },
    "MS1": {
        "수와연산": [
            (2, "정수덧셈", ["정수"]),
            (3, "정수뺄셈", ["정수"]),
            (4, "정수곱셈", ["정수"]),
            (5, "정수나눗셈", ["정수"]),
        ],
        "문자와식": [
            (6, "일차방정식", ["일차방정식"]),
            (8, "일차함수", ["일차함수"]),
        ],
        "기하": [
            (9, "피타고라스정리", ["피타고라스", "직각삼각형"]),
            (22, "삼각형넓이", ["삼각형", "넓이"]),
            (24, "원의넓이", ["원", "넓이"]),
        ],
        "함수": [
            (8, "일차함수", ["일차함수", "그래프"]),
        ]
    }
}


def generate_problem_id(problem_type: int, seed: int, grade_band: str) -> str:
    """고유 문항 ID 생성"""
    raw = f"M-{grade_band}-{problem_type}-{seed}"
    return hashlib.md5(raw.encode()).hexdigest()[:12].upper()


def generate_math_item(
    problem_type: int,
    seed: int,
    grade_band: str,
    area: str,
    name: str,
    concept_tags: List[str]
) -> Dict[str, Any]:
    """단일 수학 문항 생성"""
    random.seed(seed)
    
    try:
        problem, solution = mathgenerator.genById(problem_type)
    except:
        return None
    
    # 문제를 stem으로, 답을 answer로
    item_id = generate_problem_id(problem_type, seed, grade_band)
    
    # 오답 생성 (정답 ±10%, ±20%, ±30%)
    try:
        correct_val = float(solution)
        distractors = [
            round(correct_val * 1.1, 2),
            round(correct_val * 0.9, 2),
            round(correct_val * 1.2, 2),
        ]
        
        choices = [
            {"id": "a", "label": str(distractors[0])},
            {"id": "b", "label": str(correct_val)},
            {"id": "c", "label": str(distractors[1])},
            {"id": "d", "label": str(distractors[2])},
        ]
        random.shuffle(choices)
        correct_choice = next(c["id"] for c in choices if c["label"] == str(correct_val))
    except:
        # 객관식 변환 실패시 단답형
        choices = None
        correct_choice = solution
    
    # 난이도 추정 (문제 복잡도 기반)
    difficulty = min(10, max(1, len(str(problem)) // 10 + problem_type // 5))
    
    return {
        "id": item_id,
        "subject": "math",
        "area": f"math.{area}",
        "gradeBand": [grade_band],
        "conceptTag": concept_tags,
        "stem": {
            "type": "text",
            "payload": problem
        },
        "choices": choices,
        "answer": {
            "kind": "mcq" if choices else "short",
            "value": correct_choice if choices else solution
        },
        "source": {
            "generator": "mathgenerator",
            "type": problem_type,
            "seed": seed,
            "license": "MIT"
        },
        "difficulty": difficulty,
        "variants": [f"seed:{seed}", f"type:{problem_type}"]
    }


def build_content_bank(seeds_per_type: int = 50) -> Dict[str, List[Dict]]:
    """전체 문항 은행 생성"""
    content = {"ES56": [], "MS1": []}
    
    for grade_band, areas in PROBLEM_SETS.items():
        print(f"\n=== {grade_band} 문항 생성 ===")
        
        for area_name, problem_types in areas.items():
            print(f"  영역: {area_name}")
            
            for problem_type, name, tags in problem_types:
                generated = 0
                for seed in range(seeds_per_type):
                    item = generate_math_item(
                        problem_type, seed, grade_band, area_name, name, tags
                    )
                    if item:
                        content[grade_band].append(item)
                        generated += 1
                
                print(f"    {name}: {generated}개")
    
    return content


def export_to_json(content: Dict[str, List[Dict]], output_dir: Path):
    """JSON 파일로 내보내기"""
    output_dir.mkdir(parents=True, exist_ok=True)
    
    for grade_band, items in content.items():
        filename = f"math.{grade_band.lower()}.generated.json"
        filepath = output_dir / filename
        
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(items, f, ensure_ascii=False, indent=2)
        
        print(f"\n✓ {filepath} 생성: {len(items)}개 문항")


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="수학 문항 자동 생성")
    parser.add_argument("--seeds", type=int, default=50, help="문제 유형당 생성 개수")
    parser.add_argument("--output", type=str, 
                        default="/home/lchangoo/Workspace/jihoo-rebuild-game/apps/web/content/math",
                        help="출력 디렉토리")
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("파라메트릭 수학 문항 생성기")
    print("=" * 60)
    
    # 문항 생성
    content_bank = build_content_bank(seeds_per_type=args.seeds)
    
    # 통계
    total = sum(len(items) for items in content_bank.values())
    print(f"\n총 생성: {total}개")
    for band, items in content_bank.items():
        print(f"  {band}: {len(items)}개")
    
    # 내보내기
    output_path = Path(args.output)
    export_to_json(content_bank, output_path)
    
    print("\n✅ 생성 완료!")

