# Game Launcher

这是一个基于 Tauri v2、Rust、React、TypeScript、Vite、Tailwind CSS 和 framer-motion 构建的 Windows Galgame 桌面启动器。

## 项目简介

这个项目是一个本地游戏启动器，主要用于：

- 管理 Galgame 可执行文件
- 展示自定义封面或自动生成封面
- 从启动器内启动和结束游戏
- 记录游戏状态
- 提供多语言界面
- 提供带动画的 PCL 风格桌面界面

## 功能特性

- 添加本地 `.exe` 游戏
- 使用 exe 文件名作为默认游戏名
- 支持自定义显示名称
- 支持恢复为默认名称
- 未提供自定义封面时，自动提取 exe 图标作为封面
- 提取失败时自动生成占位封面
- 从启动器中启动游戏
- 在启动器中显示“运行中”状态
- 在启动器中直接结束游戏进程
- 支持游戏状态管理：
  - `unplayed`
  - `playing`
  - `finished`
- 支持分类筛选
- 支持按游戏名搜索
- 支持三种界面语言：
  - 简体中文
  - 英文
  - 日文

## 技术栈

- 桌面框架：Tauri v2
- 后端：Rust
- 前端：React 18 + TypeScript
- 构建工具：Vite
- 样式：Tailwind CSS + 自定义 CSS
- 动画：framer-motion
- 包管理器：pnpm

## 项目结构

```text
game-launcher/
├── src/                     # React 前端
├── src-tauri/               # Tauri + Rust 后端
├── release/                 # 已构建的可执行产物
├── run-galgame-launcher.bat # 双击启动脚本
├── package.json
└── README 文档
```

## 前端关键文件

- `src/App.tsx`
  - 主界面布局、分类、搜索、语言切换、动态背景
- `src/hooks/useGames.ts`
  - Tauri 命令调用、运行状态同步、Toast 管理
- `src/hooks/useLocale.ts`
  - 语言切换与持久化
- `src/i18n.ts`
  - 中文、英文、日文文案
- `src/components/GameCard.tsx`
  - 卡片动画、运行状态、重命名、恢复默认名、管理菜单
- `src/components/AddGameModal.tsx`
  - 添加游戏流程、选择 exe、可选封面上传

## 后端关键文件

- `src-tauri/src/lib.rs`
  - Tauri 程序入口与全局状态注册
- `src-tauri/src/commands.rs`
  - 添加/读取/改名/改状态/启动/结束/删除等命令
- `src-tauri/src/store.rs`
  - JSON 读写、封面复制、图标提取、占位封面生成
- `src-tauri/src/models.rs`
  - Rust 侧共享数据结构

## 数据模型

每个游戏记录大致包含以下字段：

- `id`
- `name`
- `default_name`
- `exe_path`
- `cover_path`
- `added_date`
- `status`

游戏数据保存在应用数据目录下的 `games.json`。
封面文件保存在应用数据目录下的 `covers/` 目录。

## 开发方式

### 前置环境

- Node.js
- pnpm
- Rust 工具链
- Tauri 的 Windows 依赖环境

### 安装依赖

```powershell
pnpm install
```

### 开发模式运行

```powershell
pnpm tauri dev
```

### 构建前端

```powershell
pnpm build
```

### 检查 Rust 后端

```powershell
cd src-tauri
cargo check
```

## 双击启动

也可以直接双击下面这个脚本：

```text
run-galgame-launcher.bat
```

脚本会尝试：

- 自动补上常见 Rust 和 Node 路径
- 如果存在已构建的 exe，则直接启动
- 否则执行 `pnpm tauri dev`

## 界面特点

- 深色毛玻璃风格
- 基于封面的动态背景
- 参考 PCL 的卡片布局与交互动效
- 悬停果冻动画
- 点击启动的按压回弹动画
- 右下角 Toast 通知

## 当前状态

当前项目已支持：

- 游戏导入
- 默认名 / 自定义名
- 默认封面 / 自定义封面
- 运行中状态同步
- 从启动器结束游戏
- 状态管理
- 多语言界面

## License

当前仓库中暂未包含单独的许可证文件。
