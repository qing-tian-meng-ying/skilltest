# test-skill-demo

> 中文 emoji 风格的 Git 提交信息生成器 skill

[![skills.sh](https://skills.sh/b/qing-tian-meng-ying/skilltest)](https://skills.sh/qing-tian-meng-ying/skilltest)

一个用于学习 [skills.sh](https://skills.sh) 全流程（创建 → 测试 → 上传 → 安装）的演示项目。

## 功能

让你的 AI agent 在 git 提交时自动生成符合规范的中文 commit message：

```
feat: ✨ 添加用户登录接口
```

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
    └── SKILL.md          # skill 主文件，含 YAML frontmatter
```

## 开发流程

1. **本地编辑** `test-skill-demo/SKILL.md`
2. **本地测试**：`npx skills add ./test-skill-demo -g`
3. **提交推送**：`git push` 到 GitHub
4. **他人安装**：`npx skills add qing-tian-meng-ying/skilltest`

## 许可

MIT
