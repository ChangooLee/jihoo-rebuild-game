#!/usr/bin/env python3
"""
사회 문제 생성기
지리, 역사, 정치·법, 경제 기반 문항
"""

import json
import random
import hashlib
from pathlib import Path
from typing import List, Dict, Any

# 사회 템플릿
SOCIAL_TEMPLATES = {
    "ES": {
        "지리": [
            ("우리나라는 어느 대륙에 있나?", ["아시아", "유럽", "아프리카", "아메리카"]),
            ("서울은 어느 방향에 있나?", ["북쪽", "남쪽", "동쪽", "서쪽"]),
        ],
        "역사": [
            ("한글을 만든 왕은?", ["세종대왕", "이순신", "유관순", "안중근"]),
            ("3.1운동은 언제?", ["1919년", "1945년", "1950년", "1960년"]),
        ],
        "정치법": [
            ("국민이 가진 기본 권리는?", ["자유권", "세금", "의무", "책임"]),
            ("민주주의의 핵심은?", ["국민 주권", "왕의 권력", "군대의 힘", "돈"]),
        ],
        "경제": [
            ("물건을 사고파는 곳은?", ["시장", "학교", "병원", "공원"]),
            ("돈을 모으는 곳은?", ["은행", "가게", "놀이터", "도서관"]),
        ]
    },
    "MS1": {
        "지리": [
            ("적도 부근의 기후는?", ["열대", "온대", "한대", "사막"]),
            ("세계 최대 대양은?", ["태평양", "대서양", "인도양", "북극해"]),
        ],
        "역사": [
            ("고려 시대의 발명품은?", ["금속활자", "종이", "나침반", "화약"]),
            ("일제 강점기는 언제?", ["1910-1945", "1900-1910", "1945-1960", "1960-2000"]),
        ],
        "정치법": [
            ("삼권분립의 세 권력은?", ["입법, 행정, 사법", "왕, 신하, 백성", "군대, 경찰, 소방", "돈, 땅, 사람"]),
            ("대통령의 임기는?", ["5년", "4년", "6년", "평생"]),
        ],
        "경제": [
            ("수요가 증가하면 가격은?", ["오른다", "내린다", "그대로", "0이 된다"]),
            ("세금의 용도는?", ["공공 서비스", "개인 저축", "회사 이익", "외국 지원"]),
        ]
    }
}


def generate_problem_id(area: str, seed: int, grade_band: str) -> str:
    """고유 문항 ID 생성"""
    raw = f"SS-{grade_band}-{area}-{seed}"
    return hashlib.md5(raw.encode()).hexdigest()[:12].upper()


def generate_social_item(seed: int, grade_band: str, area: str, template: tuple) -> Dict[str, Any]:
    """사회 문항 생성"""
    random.seed(seed)
    
    question, choices = template
    correct = choices[0]
    shuffled = choices.copy()
    random.shuffle(shuffled)
    
    choice_objs = [{"id": chr(97+i), "label": c} for i, c in enumerate(shuffled)]
    correct_id = next(c["id"] for c in choice_objs if c["label"] == correct)
    
    difficulty = 2 + (seed % 4)
    
    concept_map = {
        "지리": "geography",
        "역사": "history",
        "정치법": "politics",
        "경제": "economy"
    }
    
    return {
        "id": generate_problem_id(area, seed, grade_band),
        "subject": "social",
        "area": f"social.{concept_map[area]}",
        "gradeBand": [grade_band],
        "conceptTag": [concept_map[area], "concept"],
        "stem": {
            "type": "text",
            "payload": question
        },
        "choices": choice_objs,
        "answer": {
            "kind": "mcq",
            "value": correct_id
        },
        "source": {
            "generator": "social_template",
            "seed": seed,
            "license": "CC0"
        },
        "difficulty": difficulty,
        "variants": [f"seed:{seed}"]
    }


def build_content_bank(seeds_per_type: int = 30, seed_offset: int = 0) -> Dict[str, List[Dict]]:
    """전체 사회 문항 생성"""
    content = {"ES": [], "MS1": []}
    
    for grade_band, areas in SOCIAL_TEMPLATES.items():
        print(f"\n=== {grade_band} 사회 문항 생성 ===")
        
        for area_name, templates in areas.items():
            print(f"  영역: {area_name}")
            generated = 0
            
            for template_idx, template in enumerate(templates):
                for i in range(seeds_per_type):
                    seed = seed_offset + template_idx * seeds_per_type + i
                    item = generate_social_item(seed, grade_band, area_name, template)
                    
                    if item:
                        content[grade_band].append(item)
                        generated += 1
            
            print(f"    {area_name}: {generated}개")
    
    return content


def export_to_json(content: Dict[str, List[Dict]], output_dir: Path):
    """JSON 파일로 내보내기"""
    output_dir.mkdir(parents=True, exist_ok=True)
    
    for grade_band, items in content.items():
        filename = f"social.{grade_band.lower()}.generated.json"
        filepath = output_dir / filename
        
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(items, f, ensure_ascii=False, indent=2)
        
        print(f"\n✓ {filepath} 생성: {len(items)}개 문항")


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="사회 문항 자동 생성")
    parser.add_argument("--seeds", type=int, default=30, help="템플릿당 생성 개수")
    parser.add_argument("--offset", type=int, default=0, help="시드 오프셋")
    parser.add_argument("--output", type=str,
                        default="/home/lchangoo/Workspace/jihoo-rebuild-game/apps/web/content/social",
                        help="출력 디렉토리")
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("사회 문항 생성기")
    print(f"시드 범위: {args.offset} ~ {args.offset + args.seeds}")
    print("=" * 60)
    
    content_bank = build_content_bank(seeds_per_type=args.seeds, seed_offset=args.offset)
    
    total = sum(len(items) for items in content_bank.values())
    print(f"\n총 생성: {total}개")
    for band, items in content_bank.items():
        print(f"  {band}: {len(items)}개")
    
    output_path = Path(args.output)
    export_to_json(content_bank, output_path)
    
    print("\n✅ 생성 완료!")

