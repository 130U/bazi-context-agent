# 给产品经理的使用说明：你不需要会写代码

这套文件的目标：让你把一个“八字验时辰 + 信息框增强预测”的 MVP 交给 Codex 跑起来。

一句话原则：

```text
定八字之前：不用 AI 做最终判断。
定八字之后：AI 才参与信息框推理和预测。
```

系统先用传统验时辰 symbol 做弱先验，再用重大年份做程序化回测，最后才让 AI 基于已定候选盘和用户信息框进行预测。

## 文件怎么摆

保持这些文件和目录在 repo 根目录：

```text
AGENTS.md
docs/
configs/
prompts/
pm_checklists/
```

## 每一轮贴哪个文件

| 情况 | 粘贴哪个文件 |
|---|---|
| 第一次启动项目 | `prompts/ROUND_01_GOAL_BOOTSTRAP.md` |
| 第一轮跑完，能看到骨架和测试 | `prompts/ROUND_02_GOAL_QUESTIONNAIRE_AND_SCORING.md` |
| 问卷和评分跑通后，要做页面 | `prompts/ROUND_03_GOAL_UI_FLOW.md` |
| 页面跑通后，要接 AI 预测 | `prompts/ROUND_04_GOAL_AI_PREDICTION.md` |
| 想整理 GitHub 文档、README、demo 数据 | `prompts/ROUND_05_GOAL_GITHUB_POLISH.md` |
| build/test 失败 | `prompts/DEBUG_FIX_BUILD.md` |
| 看不懂 Codex 做了什么 | `prompts/ASK_FOR_STATUS_AND_DIFF.md` |
| Codex 偏离方向，比如让 AI 定时辰 | `prompts/CORRECT_AI_BOUNDARY.md` |
| 想继续但不要乱改 | `prompts/CONTINUE_NEXT_CHECKPOINT.md` |

## 第一轮完成检查

看 `pm_checklists/ROUND_01_ACCEPTANCE.md`。不会代码也可以检查：

1. repo 里有 `package.json`。
2. 有 `src/`。
3. 有 TypeScript 类型。
4. 有读取 `configs/question_bank.v1.json` 的代码。
5. 有 symbol prior scoring。
6. 有候选盘生成 stub。
7. 有测试。
8. Codex 最后报告跑了什么验证。
