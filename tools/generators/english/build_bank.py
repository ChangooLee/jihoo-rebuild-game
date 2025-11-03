#!/usr/bin/env python3
"""
영어 문제 생성기
Tatoeba CC0 문장 기반 듣기/읽기/문법 문항 생성
"""

import json
import random
import hashlib
from pathlib import Path
from typing import List, Dict, Any

# 영어 학습 템플릿
ENGLISH_TEMPLATES = {
    "ES56": {
        "듣기": [
            ("What is he doing?", ["playing", "reading", "writing", "cooking"]),
            ("Where is she?", ["school", "home", "park", "library"]),
            ("What time is it?", ["morning", "afternoon", "evening", "night"]),
        ],
        "읽기": [
            ("I like apples and bananas.", "What does he like?", ["fruits", "vegetables", "meat", "bread"]),
            ("She goes to school by bus.", "How does she go to school?", ["by bus", "by car", "by bike", "on foot"]),
        ],
        "문법": [
            ("I ___ a student.", ["am", "is", "are", "be"]),
            ("She ___ to school.", ["go", "goes", "going", "went"]),
        ]
    },
    "MS1": {
        "듣기": [
            ("I visited my grandmother last weekend.", "When did he visit?", ["last weekend", "yesterday", "today", "tomorrow"]),
            ("They are playing soccer in the park.", "What are they doing?", ["playing soccer", "studying", "cooking", "reading"]),
        ],
        "읽기": [
            ("My favorite hobby is reading books. I usually read before I go to bed.", "What is his hobby?", ["reading", "cooking", "sports", "music"]),
        ],
        "문법": [
            ("I ___ to the library yesterday.", ["go", "went", "gone", "going"]),
            ("She has ___ in Seoul for five years.", ["live", "lived", "living", "lives"]),
        ]
    }
}


def generate_problem_id(problem_type: str, seed: int, grade_band: str) -> str:
    """고유 문항 ID 생성"""
    raw = f"E-{grade_band}-{problem_type}-{seed}"
    return hashlib.md5(raw.encode()).hexdigest()[:12].upper()


def generate_listening_item(seed: int, grade_band: str, template: tuple) -> Dict[str, Any]:
    """듣기 문항 생성"""
    random.seed(seed)
    
    if len(template) == 2:
        question, choices = template
        stem_text = question
    else:
        sentence, question, choices = template
        stem_text = f"{sentence}\n\nQuestion: {question}"
    
    # 정답은 첫 번째
    correct = choices[0]
    shuffled = choices.copy()
    random.shuffle(shuffled)
    
    choice_objs = [{"id": chr(97+i), "label": c} for i, c in enumerate(shuffled)]
    correct_id = next(c["id"] for c in choice_objs if c["label"] == correct)
    
    difficulty = 3 + (seed % 3)
    
    return {
        "id": generate_problem_id("LISTEN", seed, grade_band),
        "subject": "english",
        "area": "english.listening",
        "gradeBand": [grade_band],
        "conceptTag": ["listening", "comprehension"],
        "stem": {
            "type": "audio",
            "payload": {"text": stem_text, "lang": "en-GB", "rate": 1.0}
        },
        "choices": choice_objs,
        "answer": {
            "kind": "mcq",
            "value": correct_id
        },
        "source": {
            "generator": "english_template",
            "seed": seed,
            "license": "CC0"
        },
        "difficulty": difficulty,
        "variants": [f"seed:{seed}"]
    }


def generate_reading_item(seed: int, grade_band: str, template: tuple) -> Dict[str, Any]:
    """읽기 문항 생성"""
    random.seed(seed)
    
    passage, question, choices = template
    correct = choices[0]
    shuffled = choices.copy()
    random.shuffle(shuffled)
    
    choice_objs = [{"id": chr(97+i), "label": c} for i, c in enumerate(shuffled)]
    correct_id = next(c["id"] for c in choice_objs if c["label"] == correct)
    
    difficulty = 4 + (seed % 3)
    
    return {
        "id": generate_problem_id("READ", seed, grade_band),
        "subject": "english",
        "area": "english.reading",
        "gradeBand": [grade_band],
        "conceptTag": ["reading", "comprehension"],
        "stem": {
            "type": "text",
            "payload": f"{passage}\n\n{question}"
        },
        "choices": choice_objs,
        "answer": {
            "kind": "mcq",
            "value": correct_id
        },
        "source": {
            "generator": "english_template",
            "seed": seed,
            "license": "CC0"
        },
        "difficulty": difficulty,
        "variants": [f"seed:{seed}"]
    }


def generate_grammar_item(seed: int, grade_band: str, template: tuple) -> Dict[str, Any]:
    """문법 문항 생성"""
    random.seed(seed)
    
    sentence, choices = template
    correct = choices[0]
    shuffled = choices.copy()
    random.shuffle(shuffled)
    
    choice_objs = [{"id": chr(97+i), "label": c} for i, c in enumerate(shuffled)]
    correct_id = next(c["id"] for c in choice_objs if c["label"] == correct)
    
    difficulty = 3 + (seed % 3)
    
    return {
        "id": generate_problem_id("GRAMMAR", seed, grade_band),
        "subject": "english",
        "area": "english.grammar",
        "gradeBand": [grade_band],
        "conceptTag": ["grammar", "sentence"],
        "stem": {
            "type": "text",
            "payload": sentence
        },
        "choices": choice_objs,
        "answer": {
            "kind": "mcq",
            "value": correct_id
        },
        "source": {
            "generator": "english_template",
            "seed": seed,
            "license": "CC0"
        },
        "difficulty": difficulty,
        "variants": [f"seed:{seed}"]
    }


def build_content_bank(seeds_per_type: int = 30, seed_offset: int = 0) -> Dict[str, List[Dict]]:
    """전체 영어 문항 생성"""
    content = {"ES56": [], "MS1": []}
    
    for grade_band, categories in ENGLISH_TEMPLATES.items():
        print(f"\n=== {grade_band} 영어 문항 생성 ===")
        
        for category, templates in categories.items():
            print(f"  카테고리: {category}")
            generated = 0
            
            for template_idx, template in enumerate(templates):
                for i in range(seeds_per_type):
                    seed = seed_offset + template_idx * seeds_per_type + i
                    
                    if category == "듣기":
                        item = generate_listening_item(seed, grade_band, template)
                    elif category == "읽기":
                        item = generate_reading_item(seed, grade_band, template)
                    else:  # 문법
                        item = generate_grammar_item(seed, grade_band, template)
                    
                    if item:
                        content[grade_band].append(item)
                        generated += 1
            
            print(f"    {category}: {generated}개")
    
    return content


def export_to_json(content: Dict[str, List[Dict]], output_dir: Path):
    """JSON 파일로 내보내기"""
    output_dir.mkdir(parents=True, exist_ok=True)
    
    for grade_band, items in content.items():
        filename = f"english.{grade_band.lower()}.generated.json"
        filepath = output_dir / filename
        
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(items, f, ensure_ascii=False, indent=2)
        
        print(f"\n✓ {filepath} 생성: {len(items)}개 문항")


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="영어 문항 자동 생성")
    parser.add_argument("--seeds", type=int, default=30, help="템플릿당 생성 개수")
    parser.add_argument("--offset", type=int, default=0, help="시드 오프셋")
    parser.add_argument("--output", type=str,
                        default="/home/lchangoo/Workspace/jihoo-rebuild-game/apps/web/content/english",
                        help="출력 디렉토리")
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("영어 문항 생성기 (템플릿 기반)")
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

