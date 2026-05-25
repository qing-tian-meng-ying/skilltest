#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
萧炎语录生成器

根据场景输出符合萧炎口吻的回应模板，供 agent 包装到对话中。
零依赖，纯 Python 标准库，可在任何 Python 3.8+ 环境直接运行。
"""

from __future__ import annotations

import argparse
import json
import random
import sys
from typing import Any


# ============ 语料库（按场景分类） ============

QUOTES: dict[str, list[str]] = {
    "encourage": [
        "三十年河东，三十年河西，莫欺少年穷。",
        "修炼一途，原就没有捷径。一步一步走，比谁都走得稳。",
        "今日所受之苦，皆是他日翱翔九天之资本。",
        "今天打不过，是今天的事；明天能不能打过，看你今晚肯不肯熬。",
        "敌强我弱时，藏锋是为了将来一刀更狠。",
    ],
    "fight": [
        "动我朋友？先问过萧某手中的玄重尺。",
        "今日之耻，他日萧某必百倍奉还。",
        "退一步是为了下一步走得更狠。",
        "炎盟之人，皆我兄弟姐妹。动他们一根毫毛，便是与我萧炎为敌。",
    ],
    "decide": [
        "就这么定了，不必多言。",
        "此言一出，驷马难追。",
        "容不得半分退让。",
        "言尽于此，兄台好自为之。",
    ],
    "humble": [
        "在下萧炎，乌坦城人，幸会。",
        "萧某不才，斗胆一言。",
        "敢问兄台高姓大名？",
        "萧某萧炎，加玛帝国乌坦城人。今日有缘，便陪兄台聊上一聊。",
    ],
    "tech": [
        "此问萧某虽不识其形，却识其意——好比修炼时根基不稳，强求无益。",
        "代码之道，与修炼一途无二：欲速则不达，根基不稳则万事崩。",
        "兄台莫急，让萧某细细看来。",
        "这门道萧某虽未亲历，但理同于斗气——一步错则步步错，先回头查源头。",
    ],
}

ADDRESS_FORMS: dict[str, str] = {
    "elder": "前辈",
    "peer_male": "兄台",
    "peer_female": "姑娘",
    "junior": "小子",
    "neutral": "朋友",
}

CLOSINGS: list[str] = [
    "言尽于此。",
    "他日再会。",
    "兄台好自为之。",
    "萧某告辞。",
]


# ============ 主逻辑 ============

def generate(
    scene: str,
    address: str = "neutral",
    context: str | None = None,
    seed: int | None = None,
) -> dict[str, Any]:
    """
    根据场景生成萧炎风格的回应模板

    Args:
        scene: 场景类别，必须是 QUOTES 的 key 之一
        address: 称呼对方的方式，必须是 ADDRESS_FORMS 的 key 之一
        context: 可选上下文（用户的原问题/情境）
        seed: 可选随机种子，用于复现输出

    Returns:
        包含 opening / quote / closing / address / scene 的字典
    """
    if seed is not None:
        random.seed(seed)

    if scene not in QUOTES:
        raise ValueError(
            f"未知场景: {scene!r}。可选: {', '.join(QUOTES.keys())}"
        )
    if address not in ADDRESS_FORMS:
        raise ValueError(
            f"未知称呼: {address!r}。可选: {', '.join(ADDRESS_FORMS.keys())}"
        )

    addr = ADDRESS_FORMS[address]
    quote = random.choice(QUOTES[scene])
    closing = random.choice(CLOSINGS)

    # 不同场景的开场白模板
    opening_templates = {
        "encourage": f"{addr}莫急，听萧某一言——",
        "fight": f"哼，{addr}此言差矣。",
        "decide": f"{addr}，",
        "humble": "",
        "tech": f"{addr}稍安。",
    }
    opening = opening_templates.get(scene, "")

    return {
        "scene": scene,
        "address": addr,
        "opening": opening,
        "quote": quote,
        "closing": closing,
        "context": context,
        "render": _render(opening, quote, closing, context),
    }


def _render(
    opening: str, quote: str, closing: str, context: str | None
) -> str:
    """将各部分拼接为可直接展示的整段文字"""
    parts: list[str] = []
    if opening:
        parts.append(opening)
    parts.append(quote)
    if context:
        parts.append(f"（兄台所言「{context}」，萧某记下了。）")
    parts.append(closing)
    return " ".join(parts)


# ============ CLI 入口 ============

def main() -> int:
    parser = argparse.ArgumentParser(
        prog="xiaoyan.py",
        description="萧炎语录生成器：按场景输出萧炎风格的回应模板",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""\
场景说明:
  encourage  鼓励他人、给人打气
  fight      面对冲突、维护朋友
  decide     做决定、立誓
  humble     自我介绍、谦辞
  tech       回应技术/学习类问题

称呼说明:
  elder         对长辈/前辈
  peer_male     对平辈男性（默认"兄台"）
  peer_female   对平辈女性
  junior        对晚辈
  neutral       中性称呼"朋友"

示例:
  python scripts/xiaoyan.py --scene encourage
  python scripts/xiaoyan.py --scene tech --address peer_male --context "代码报错了"
  python scripts/xiaoyan.py --scene fight --seed 42
""",
    )
    parser.add_argument(
        "--scene",
        required=True,
        choices=list(QUOTES.keys()),
        help="场景类别（必填）",
    )
    parser.add_argument(
        "--address",
        default="neutral",
        choices=list(ADDRESS_FORMS.keys()),
        help="称呼对方的方式（默认 neutral）",
    )
    parser.add_argument(
        "--context",
        default=None,
        help="可选上下文：用户原问题或情境的简短摘要",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=None,
        help="可选随机种子，用于复现输出",
    )
    parser.add_argument(
        "--format",
        default="json",
        choices=["json", "text"],
        help="输出格式：json（结构化，默认）/ text（仅渲染后的文字）",
    )

    args = parser.parse_args()

    try:
        result = generate(
            scene=args.scene,
            address=args.address,
            context=args.context,
            seed=args.seed,
        )
    except ValueError as e:
        print(f"参数错误: {e}", file=sys.stderr)
        return 2
    except Exception as e:
        print(f"内部错误: {e}", file=sys.stderr)
        return 1

    if args.format == "json":
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print(result["render"])

    return 0


if __name__ == "__main__":
    sys.exit(main())
