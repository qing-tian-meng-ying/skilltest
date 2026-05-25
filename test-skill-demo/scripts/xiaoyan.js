#!/usr/bin/env node
/**
 * 萧炎语录生成器（Node.js 版）
 *
 * 根据场景输出符合萧炎口吻的回应模板，供 agent 包装到对话中。
 * 零外部依赖，仅用 Node.js 内置模块。
 *
 * 使用 Node.js 而非 Python 的原因：
 * - skills CLI 通过 npx 分发，运行环境一定具备 Node.js
 * - node 命令名唯一，不存在 python/python3 之类的歧义
 *
 * 用法：node scripts/xiaoyan.js --scene encourage --address peer_male
 */

'use strict';

// ============ 语料库 ============

const QUOTES = {
  encourage: [
    '三十年河东，三十年河西，莫欺少年穷。',
    '修炼一途，原就没有捷径。一步一步走，比谁都走得稳。',
    '今日所受之苦，皆是他日翱翔九天之资本。',
    '今天打不过，是今天的事；明天能不能打过，看你今晚肯不肯熬。',
    '敌强我弱时，藏锋是为了将来一刀更狠。',
  ],
  fight: [
    '动我朋友？先问过萧某手中的玄重尺。',
    '今日之耻，他日萧某必百倍奉还。',
    '退一步是为了下一步走得更狠。',
    '炎盟之人，皆我兄弟姐妹。动他们一根毫毛，便是与我萧炎为敌。',
  ],
  decide: [
    '就这么定了，不必多言。',
    '此言一出，驷马难追。',
    '容不得半分退让。',
    '言尽于此，兄台好自为之。',
  ],
  humble: [
    '在下萧炎，乌坦城人，幸会。',
    '萧某不才，斗胆一言。',
    '敢问兄台高姓大名？',
    '萧某萧炎，加玛帝国乌坦城人。今日有缘，便陪兄台聊上一聊。',
  ],
  tech: [
    '此问萧某虽不识其形，却识其意——好比修炼时根基不稳，强求无益。',
    '代码之道，与修炼一途无二：欲速则不达，根基不稳则万事崩。',
    '兄台莫急，让萧某细细看来。',
    '这门道萧某虽未亲历，但理同于斗气——一步错则步步错，先回头查源头。',
  ],
};

const ADDRESS_FORMS = {
  elder: '前辈',
  peer_male: '兄台',
  peer_female: '姑娘',
  junior: '小子',
  neutral: '朋友',
};

const CLOSINGS = [
  '言尽于此。',
  '他日再会。',
  '兄台好自为之。',
  '萧某告辞。',
];

const OPENINGS = {
  encourage: (addr) => `${addr}莫急，听萧某一言——`,
  fight: (addr) => `哼，${addr}此言差矣。`,
  decide: (addr) => `${addr}，`,
  humble: () => '',
  tech: (addr) => `${addr}稍安。`,
};

// ============ 简易随机数（支持 seed）============

function makeRng(seed) {
  if (seed === undefined || seed === null) {
    return Math.random;
  }
  // 线性同余生成器，保证可复现
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function pick(arr, rng) {
  return arr[Math.floor(rng() * arr.length)];
}

// ============ 主逻辑 ============

function generate({ scene, address = 'neutral', context = null, seed = null }) {
  if (!(scene in QUOTES)) {
    throw new Error(
      `未知场景: ${JSON.stringify(scene)}。可选: ${Object.keys(QUOTES).join(', ')}`
    );
  }
  if (!(address in ADDRESS_FORMS)) {
    throw new Error(
      `未知称呼: ${JSON.stringify(address)}。可选: ${Object.keys(ADDRESS_FORMS).join(', ')}`
    );
  }

  const rng = makeRng(seed);
  const addr = ADDRESS_FORMS[address];
  const quote = pick(QUOTES[scene], rng);
  const closing = pick(CLOSINGS, rng);
  const opening = OPENINGS[scene](addr);

  const parts = [];
  if (opening) parts.push(opening);
  parts.push(quote);
  if (context) parts.push(`（兄台所言「${context}」，萧某记下了。）`);
  parts.push(closing);

  return {
    scene,
    address: addr,
    opening,
    quote,
    closing,
    context,
    render: parts.join(' '),
  };
}

// ============ CLI 解析 ============

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (token === '-h' || token === '--help') {
      args.help = true;
      continue;
    }
    if (token.startsWith('--')) {
      const key = token.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) {
        args[key] = true;
      } else {
        args[key] = next;
        i++;
      }
    }
  }
  return args;
}

function printHelp() {
  console.log(`用法: node scripts/xiaoyan.js [选项]

萧炎语录生成器：按场景输出萧炎风格的回应模板

选项:
  --scene <场景>      必填，场景类别
  --address <称呼>    可选，对方称呼，默认 neutral
  --context "<文本>"  可选，用户情境的简短摘要
  --seed <数字>       可选，随机种子，用于复现输出
  --format json|text  可选，输出格式，默认 json
  -h, --help          显示本帮助

场景:
  encourage  鼓励他人、给人打气
  fight      面对冲突、维护朋友
  decide     做决定、立誓
  humble     自我介绍、谦辞
  tech       回应技术/学习类问题

称呼:
  elder         对长辈/前辈
  peer_male     对平辈男性（默认"兄台"）
  peer_female   对平辈女性
  junior        对晚辈
  neutral       中性称呼"朋友"

示例:
  node scripts/xiaoyan.js --scene encourage --address peer_male
  node scripts/xiaoyan.js --scene tech --context "代码报错了" --format text
  node scripts/xiaoyan.js --scene fight --seed 42`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return 0;
  }

  if (!args.scene) {
    console.error('参数错误: --scene 是必填项');
    console.error('运行 `node scripts/xiaoyan.js --help` 查看帮助');
    return 2;
  }

  const seed = args.seed !== undefined ? Number(args.seed) : null;
  if (args.seed !== undefined && !Number.isFinite(seed)) {
    console.error(`参数错误: --seed 必须是数字，收到: ${args.seed}`);
    return 2;
  }

  const format = args.format || 'json';
  if (format !== 'json' && format !== 'text') {
    console.error(`参数错误: --format 必须是 json 或 text，收到: ${format}`);
    return 2;
  }

  let result;
  try {
    result = generate({
      scene: args.scene,
      address: args.address || 'neutral',
      context: args.context || null,
      seed,
    });
  } catch (e) {
    console.error(`参数错误: ${e.message}`);
    return 2;
  }

  if (format === 'json') {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(result.render);
  }
  return 0;
}

process.exit(main());
