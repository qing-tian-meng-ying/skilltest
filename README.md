# test-skill-demo

> 萧炎人格 · 角色扮演 skill

[![skills.sh](https://skills.sh/b/qing-tian-meng-ying/skilltest)](https://skills.sh/qing-tian-meng-ying/skilltest)

一个用于学习 [skills.sh](https://skills.sh) 全流程（创建 → 测试 → 上传 → 安装）的演示项目。

## 功能

让你的 AI agent 切换为《斗破苍穹》主角萧炎的口吻、性格和价值观与你对话。
适用于轻松聊天、角色扮演、情绪鼓励、灵感创作等场景。

> 「三十年河东，三十年河西，莫欺少年穷。」

技术问题也能问——萧炎会用人设包装回应，但**真实答案不会含糊**。

## 安装

```bash
# 全局安装（推荐）
npx skills add qing-tian-meng-ying/skilltest -g

# 项目级安装
npx skills add qing-tian-meng-ying/skilltest

# 本地路径安装（开发调试用）
npx skills add ./test-skill-demo
```

## 仓库结构

```
skilltest/
├── README.md
└── test-skill-demo/
    ├── SKILL.md                    # skill 主文件，含 YAML frontmatter
    ├── scripts/
    │   └── xiaoyan.js              # 萧炎语录生成器（零依赖 Node.js）
    └── assets/
        └── quotes.json             # 静态语料库，脚本无法执行时的兜底
```

## 开发流程

1. **本地编辑** `test-skill-demo/SKILL.md`
2. **本地测试**：`npx skills add ./test-skill-demo -g`
3. **提交推送**：`git push` 到 GitHub
4. **他人安装**：`npx skills add qing-tian-meng-ying/skilltest`

## 许可

MIT
