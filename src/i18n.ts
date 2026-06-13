import type { FilterKey, GameStatus } from "./types";

export type Locale = "zh-CN" | "en-US" | "ja-JP";

type Messages = {
  appTitle: string;
  defaultShelf: string;
  running: string;
  search: string;
  endGame: string;
  settings: string;
  loadingLibrary: string;
  emptyLibrary: string;
  emptyFiltered: string;
  sections: string;
  sidebarDescription: string;
  categories: string;
  addGame: string;
  importExecutableAndCover: string;
  addGameTitle: string;
  close: string;
  cancel: string;
  saveGame: string;
  saving: string;
  gameName: string;
  gameNamePlaceholder: string;
  gameNameHint: string;
  executable: string;
  executablePlaceholder: string;
  browse: string;
  coverImage: string;
  coverOptionalHint: string;
  autoCover: string;
  autoCoverWithExe: string;
  autoCoverEmptyExe: string;
  selectCover: string;
  useDefaultIcon: string;
  runningCounter: string;
  manage: string;
  deleteGame: string;
  renameGame: string;
  useDefaultName: string;
  renamePrompt: string;
  gameRenamed: string;
  gameNameReset: string;
  renameGameFailed: string;
  statusUpdated: string;
  gameAdded: string;
  gameRemoved: string;
  gameClosed: string;
  gameAlreadyRunning: string;
  gameLaunched: string;
  noRunningProcess: string;
  terminateSent: string;
  loadGamesFailed: string;
  updateStatusFailed: string;
  deleteGameFailed: string;
  launchGameFailed: string;
  terminateGameFailed: string;
  filterHints: Record<FilterKey, string>;
  filterLabels: Record<FilterKey, string>;
  statusLabels: Record<GameStatus, string>;
  markAs: string;
};

export const localeLabels: Record<Locale, string> = {
  "zh-CN": "中文",
  "en-US": "EN",
  "ja-JP": "日本語"
};

export const messages: Record<Locale, Messages> = {
  "zh-CN": {
    appTitle: "Galgame Launcher",
    defaultShelf: "视觉小说书架",
    running: "运行中",
    search: "搜索",
    endGame: "结束游戏",
    settings: "设置",
    loadingLibrary: "正在加载游戏库...",
    emptyLibrary: "还没有游戏，点击左侧按钮开始导入。",
    emptyFiltered: "没有符合当前条件的游戏。",
    sections: "分区",
    sidebarDescription: "用分类快速切换当前游戏库视图。",
    categories: "分类",
    addGame: "添加游戏",
    importExecutableAndCover: "导入程序与封面",
    addGameTitle: "导入 Galgame",
    close: "关闭",
    cancel: "取消",
    saveGame: "保存游戏",
    saving: "保存中...",
    gameName: "游戏名称",
    gameNamePlaceholder: "留空则使用 exe 文件名",
    gameNameHint: "可保留默认名，也可以改成自定义名称。",
    executable: "可执行文件",
    executablePlaceholder: "选择 .exe 文件",
    browse: "浏览",
    coverImage: "封面图片",
    coverOptionalHint: "可选，不设置时使用 EXE 图标",
    autoCover: "默认封面",
    autoCoverWithExe: "如果不自定义，将自动提取 EXE 图标作为封面。",
    autoCoverEmptyExe: "拖拽图片到这里，或点击选择自定义封面。",
    selectCover: "选择封面图",
    useDefaultIcon: "使用默认图标",
    runningCounter: "运行中",
    manage: "管理",
    deleteGame: "删除游戏",
    renameGame: "重命名",
    useDefaultName: "恢复默认名",
    renamePrompt: "输入新的游戏名称",
    gameRenamed: "游戏名称已更新",
    gameNameReset: "已恢复默认名称",
    renameGameFailed: "修改名称失败",
    statusUpdated: "游戏状态已更新",
    gameAdded: "游戏添加成功",
    gameRemoved: "游戏已删除",
    gameClosed: "游戏已退出",
    gameAlreadyRunning: "游戏正在运行中",
    gameLaunched: "游戏已启动",
    noRunningProcess: "当前没有运行中的游戏进程",
    terminateSent: "已发送结束游戏指令",
    loadGamesFailed: "读取游戏列表失败",
    updateStatusFailed: "更新状态失败",
    deleteGameFailed: "删除游戏失败",
    launchGameFailed: "启动游戏失败",
    terminateGameFailed: "结束游戏失败",
    filterHints: {
      all: "全部游戏",
      unplayed: "未开始",
      playing: "进行中",
      finished: "已通关"
    },
    filterLabels: {
      all: "全部",
      unplayed: "未开始",
      playing: "进行中",
      finished: "已通关"
    },
    statusLabels: {
      unplayed: "未开始",
      playing: "进行中",
      finished: "已通关"
    },
    markAs: "标记为"
  },
  "en-US": {
    appTitle: "Galgame Launcher",
    defaultShelf: "Visual Novel Shelf",
    running: "Running",
    search: "Search",
    endGame: "End Game",
    settings: "Settings",
    loadingLibrary: "Loading game library...",
    emptyLibrary: "No games yet. Use the add button on the left to import one.",
    emptyFiltered: "No games match the current filter.",
    sections: "Sections",
    sidebarDescription: "Switch the current library view through categories.",
    categories: "Categories",
    addGame: "Add Game",
    importExecutableAndCover: "Import executable and cover",
    addGameTitle: "Import Galgame",
    close: "Close",
    cancel: "Cancel",
    saveGame: "Save Game",
    saving: "Saving...",
    gameName: "Game Name",
    gameNamePlaceholder: "Leave blank to use the executable name",
    gameNameHint: "Keep the default name or type your own custom name.",
    executable: "Executable",
    executablePlaceholder: "Select a .exe file",
    browse: "Browse",
    coverImage: "Cover Image",
    coverOptionalHint: "Optional, EXE icon is used by default",
    autoCover: "Auto Cover",
    autoCoverWithExe: "Leave this empty to use the EXE icon as the default cover.",
    autoCoverEmptyExe: "Drag an image here, or click to choose a custom cover.",
    selectCover: "Select Cover",
    useDefaultIcon: "Use Default Icon",
    runningCounter: "Running",
    manage: "Manage",
    deleteGame: "Delete Game",
    renameGame: "Rename",
    useDefaultName: "Use Default Name",
    renamePrompt: "Enter a new game name",
    gameRenamed: "Game name updated",
    gameNameReset: "Default game name restored",
    renameGameFailed: "Failed to update game name",
    statusUpdated: "Status updated",
    gameAdded: "Game added",
    gameRemoved: "Game removed",
    gameClosed: "Game closed",
    gameAlreadyRunning: "Game is already running",
    gameLaunched: "Game launched",
    noRunningProcess: "No running game process",
    terminateSent: "Terminate signal sent",
    loadGamesFailed: "Failed to load games",
    updateStatusFailed: "Failed to update status",
    deleteGameFailed: "Failed to delete game",
    launchGameFailed: "Failed to launch game",
    terminateGameFailed: "Failed to terminate game",
    filterHints: {
      all: "All Games",
      unplayed: "Backlog",
      playing: "Now Playing",
      finished: "Completed"
    },
    filterLabels: {
      all: "All",
      unplayed: "Unplayed",
      playing: "Playing",
      finished: "Finished"
    },
    statusLabels: {
      unplayed: "Unplayed",
      playing: "Playing",
      finished: "Finished"
    },
    markAs: "Mark as"
  },
  "ja-JP": {
    appTitle: "Galgame Launcher",
    defaultShelf: "ビジュアルノベルシェルフ",
    running: "起動中",
    search: "検索",
    endGame: "ゲーム終了",
    settings: "設定",
    loadingLibrary: "ゲームライブラリを読み込み中...",
    emptyLibrary: "まだゲームがありません。左側の追加ボタンから取り込んでください。",
    emptyFiltered: "現在の条件に一致するゲームがありません。",
    sections: "セクション",
    sidebarDescription: "カテゴリですばやく現在のライブラリ表示を切り替えます。",
    categories: "カテゴリ",
    addGame: "ゲームを追加",
    importExecutableAndCover: "実行ファイルとカバーを取り込む",
    addGameTitle: "Galgame を取り込む",
    close: "閉じる",
    cancel: "キャンセル",
    saveGame: "保存",
    saving: "保存中...",
    gameName: "ゲーム名",
    gameNamePlaceholder: "空欄なら exe ファイル名を使います",
    gameNameHint: "既定名のままでも、自分で名前を付けても構いません。",
    executable: "実行ファイル",
    executablePlaceholder: ".exe ファイルを選択",
    browse: "参照",
    coverImage: "カバー画像",
    coverOptionalHint: "任意、未設定時は EXE アイコンを使用",
    autoCover: "自動カバー",
    autoCoverWithExe: "カスタムしない場合、EXE アイコンをカバーとして自動使用します。",
    autoCoverEmptyExe: "ここへ画像をドラッグするか、クリックしてカスタムカバーを選択してください。",
    selectCover: "カバーを選択",
    useDefaultIcon: "標準アイコンを使う",
    runningCounter: "起動中",
    manage: "管理",
    deleteGame: "ゲームを削除",
    renameGame: "名前を変更",
    useDefaultName: "既定名に戻す",
    renamePrompt: "新しいゲーム名を入力してください",
    gameRenamed: "ゲーム名を更新しました",
    gameNameReset: "既定のゲーム名に戻しました",
    renameGameFailed: "名前の更新に失敗しました",
    statusUpdated: "ゲーム状態を更新しました",
    gameAdded: "ゲームを追加しました",
    gameRemoved: "ゲームを削除しました",
    gameClosed: "ゲームが終了しました",
    gameAlreadyRunning: "ゲームはすでに起動中です",
    gameLaunched: "ゲームを起動しました",
    noRunningProcess: "起動中のゲームプロセスはありません",
    terminateSent: "終了命令を送信しました",
    loadGamesFailed: "ゲーム一覧の読み込みに失敗しました",
    updateStatusFailed: "状態の更新に失敗しました",
    deleteGameFailed: "ゲームの削除に失敗しました",
    launchGameFailed: "ゲームの起動に失敗しました",
    terminateGameFailed: "ゲームの終了に失敗しました",
    filterHints: {
      all: "すべてのゲーム",
      unplayed: "未開始",
      playing: "プレイ中",
      finished: "クリア済み"
    },
    filterLabels: {
      all: "すべて",
      unplayed: "未開始",
      playing: "プレイ中",
      finished: "クリア済み"
    },
    statusLabels: {
      unplayed: "未開始",
      playing: "プレイ中",
      finished: "クリア済み"
    },
    markAs: "次に変更"
  }
};
