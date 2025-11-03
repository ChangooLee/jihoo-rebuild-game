#!/usr/bin/env python3
"""
과학 문제 생성기
원리, 실험, 관찰 기반 문항 템플릿
"""

import json
import random
import hashlib
from pathlib import Path
from typing import List, Dict, Any

# 과학 템플릿 (4영역 기반)
SCIENCE_TEMPLATES = {
    "ES56": {
        "운동과에너지": [
            ("빛이 물에서 공기로 나갈 때 어떻게 될까?", ["굴절한다", "반사한다", "흡수된다", "그대로 진행한다"]),
            ("전구에 불이 들어오려면?", ["회로가 연결되어야 한다", "전구만 있으면 된다", "전지가 없어도 된다", "스위치가 필요없다"]),
        ],
        "물질": [
            ("물을 가열하면 무엇이 될까?", ["수증기", "얼음", "소금", "설탕"]),
            ("소금물에서 소금을 분리하려면?", ["물을 증발시킨다", "냉동시킨다", "흔든다", "색을 바꾼다"]),
        ],
        "생명": [
            ("식물이 자라는데 필요한 것은?", ["물, 빛, 공기", "돌, 모래", "소금", "어둠"]),
            ("심장의 역할은?", ["피를 온몸에 보낸다", "음식을 소화한다", "숨을 쉰다", "뼈를 만든다"]),
        ],
        "지구와우주": [
            ("낮과 밤이 생기는 이유는?", ["지구가 자전한다", "태양이 돈다", "달이 가린다", "구름 때문이다"]),
            ("비가 내리려면?", ["수증기가 응결한다", "바람만 분다", "태양이 뜬다", "추워진다"]),
        ]
    },
    "MS1": {
        "운동과에너지": [
            ("속력 = ?", ["거리/시간", "시간/거리", "거리×시간", "거리+시간"]),
            ("힘을 받은 물체는?", ["운동 상태가 변한다", "그대로다", "사라진다", "가벼워진다"]),
        ],
        "물질": [
            ("물질은 무엇으로 이루어져 있나?", ["입자", "파동", "에너지만", "빛"]),
            ("상태 변화 시 질량은?", ["변하지 않는다", "증가한다", "감소한다", "0이 된다"]),
        ],
        "생명": [
            ("세포의 기본 구조는?", ["막, 핵, 세포질", "뼈만", "근육만", "물만"]),
            ("광합성을 하는 세포소기관은?", ["엽록체", "미토콘드리아", "핵", "리보솜"]),
        ],
        "지구와우주": [
            ("해풍이 부는 이유는?", ["육지와 바다의 온도 차", "달의 인력", "지구 자전", "태양풍"]),
            ("기압이 낮으면?", ["날씨가 흐리다", "맑다", "변화없다", "별이 보인다"]),
        ]
    }
}


def generate_problem_id(area: str, seed: int, grade_band: str) -> str:
    """고유 문항 ID 생성"""
    raw = f"S-{grade_band}-{area}-{seed}"
    return hashlib.md5(raw.encode()).hexdigest()[:12].upper()


def generate_science_item(seed: int, grade_band: str, area: str, template: tuple) -> Dict[str, Any]:
    """과학 문항 생성"""
    random.seed(seed)
    
    question, choices = template
    correct = choices[0]
    shuffled = choices.copy()
    random.shuffle(shuffled)
    
    choice_objs = [{"id": chr(97+i), "label": c} for i, c in enumerate(shuffled)]
    correct_id = next(c["id"] for c in choice_objs if c["label"] == correct)
    
    difficulty = 3 + (seed % 4)
    
    concept_map = {
        "운동과에너지": "energy",
        "물질": "matter",
        "생명": "life",
        "지구와우주": "earth"
    }
    
    return {
        "id": generate_problem_id(area, seed, grade_band),
        "subject": "science",
        "area": f"science.{concept_map[area]}",
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
            "generator": "science_template",
            "seed": seed,
            "license": "CC0"
        },
        "difficulty": difficulty,
        "variants": [f"seed:{seed}"]
    }


def build_content_bank(seeds_per_type: int = 30, seed_offset: int = 0) -> Dict[str, List[Dict]]:
    """전체 과학 문항 생성"""
    content = {"ES56": [], "MS1": []}
    
    for grade_band, areas in SCIENCE_TEMPLATES.items():
        print(f"\n=== {grade_band} 과학 문항 생성 ===")
        
        for area_name, templates in areas.items():
            print(f"  영역: {area_name}")
            generated = 0
            
            for template_idx, template in enumerate(templates):
                for i in range(seeds_per_type):
                    seed = seed_offset + template_idx * seeds_per_type + i
                    item = generate_science_item(seed, grade_band, area_name, template)
                    
                    if item:
                        content[grade_band].append(item)
                        generated += 1
            
            print(f"    {area_name}: {generated}개")
    
    return content


def export_to_json(content: Dict[str, List[Dict]], output_dir: Path):
    """JSON 파일로 내보내기"""
    output_dir.mkdir(parents=True, exist_ok=True)
    
    for grade_band, items in content.items():
        filename = f"science.{grade_band.lower()}.generated.json"
        filepath = output_dir / filename
        
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(items, f, ensure_ascii=False, indent=2)
        
        print(f"\n✓ {filepath} 생성: {len(items)}개 문항")


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="과학 문항 자동 생성")
    parser.add_argument("--seeds", type=int, default=30, help="템플릿당 생성 개수")
    parser.add_argument("--offset", type=int, default=0, help="시드 오프셋")
    parser.add_argument("--output", type=str,
                        default="/home/lchangoo/Workspace/jihoo-rebuild-game/apps/web/content/science",
                        help="출력 디렉토리")
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("과학 문항 생성기")
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

