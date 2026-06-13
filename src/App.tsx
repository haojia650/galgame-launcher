import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { convertFileSrc } from "@tauri-apps/api/core";
import { motion } from "framer-motion";
import type { FilterKey, Game } from "./types";
import { useGames } from "./hooks/useGames";
import { useLocale } from "./hooks/useLocale";
import { localeLabels, messages } from "./i18n";
import { Sidebar } from "./components/Sidebar";
import { GameGrid } from "./components/GameGrid";
import { AddGameModal } from "./components/AddGameModal";
import { Toast } from "./components/Toast";

const placeholderBackgrounds = [
  "radial-gradient(circle at 20% 20%, rgba(255,180,200,0.18), transparent 32%), radial-gradient(circle at 82% 15%, rgba(196,181,253,0.15), transparent 26%), linear-gradient(135deg, #10101b 0%, #171629 42%, #0d1018 100%)",
  "radial-gradient(circle at 15% 18%, rgba(196,181,253,0.14), transparent 34%), radial-gradient(circle at 80% 22%, rgba(255,180,200,0.16), transparent 28%), linear-gradient(135deg, #0c0f18 0%, #19142a 45%, #101726 100%)"
];

function App() {
  const { locale, setLocale } = useLocale();
  const t = messages[locale];

  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [search, setSearch] = useState("");
  const [hoveredGame, setHoveredGame] = useState<Game | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [backgroundIndex, setBackgroundIndex] = useState(0);
  const [backgroundA, setBackgroundA] = useState(placeholderBackgrounds[0]);
  const [backgroundB, setBackgroundB] = useState(placeholderBackgrounds[1]);
  const [activeBackgroundLayer, setActiveBackgroundLayer] = useState<"a" | "b">("a");
  const deferredSearch = useDeferredValue(search);

  const {
    games,
    loading,
    toasts,
    busyIds,
    runningIds,
    addGame,
    updateStatus,
    updateGameName,
    deleteGame,
    launchGame,
    terminateGame,
    dismissToast
  } = useGames({
    loadGamesFailed: t.loadGamesFailed,
    gameClosed: t.gameClosed,
    gameAdded: t.gameAdded,
    statusUpdated: t.statusUpdated,
    updateStatusFailed: t.updateStatusFailed,
    gameRemoved: t.gameRemoved,
    deleteGameFailed: t.deleteGameFailed,
    gameAlreadyRunning: t.gameAlreadyRunning,
    gameLaunched: t.gameLaunched,
    launchGameFailed: t.launchGameFailed,
    noRunningProcess: t.noRunningProcess,
    terminateSent: t.terminateSent,
    terminateGameFailed: t.terminateGameFailed,
    gameRenamed: t.gameRenamed,
    gameNameReset: t.gameNameReset,
    renameGameFailed: t.renameGameFailed
  });

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const matchesFilter =
        activeFilter === "all" ? true : game.status === activeFilter;
      const matchesSearch = game.name
        .toLowerCase()
        .includes(deferredSearch.trim().toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, deferredSearch, games]);

  const selectedGame = useMemo(() => {
    if (hoveredGame) {
      return hoveredGame;
    }
    if (selectedId) {
      return games.find((game) => game.id === selectedId) ?? null;
    }
    return filteredGames[0] ?? games[0] ?? null;
  }, [filteredGames, games, hoveredGame, selectedId]);

  const nextBackground = useMemo(() => {
    return selectedGame?.cover_path
      ? `linear-gradient(180deg, rgba(7,8,15,0.24), rgba(7,8,15,0.74)), url("${convertFileSrc(
          selectedGame.cover_path
        )}")`
      : placeholderBackgrounds[backgroundIndex];
  }, [backgroundIndex, selectedGame]);

  useEffect(() => {
    setActiveBackgroundLayer((current) => {
      if (current === "a") {
        setBackgroundB(nextBackground);
        return "b";
      }
      setBackgroundA(nextBackground);
      return "a";
    });
  }, [nextBackground]);

  const emptyMessage = loading
    ? t.loadingLibrary
    : games.length === 0
      ? t.emptyLibrary
      : t.emptyFiltered;

  const selectedGameRunning = Boolean(
    selectedGame && runningIds.includes(selectedGame.id)
  );

  const filterItems = [
    { key: "all" as const, label: t.filterLabels.all, hint: t.filterHints.all },
    {
      key: "unplayed" as const,
      label: t.filterLabels.unplayed,
      hint: t.filterHints.unplayed
    },
    {
      key: "playing" as const,
      label: t.filterLabels.playing,
      hint: t.filterHints.playing
    },
    {
      key: "finished" as const,
      label: t.filterLabels.finished,
      hint: t.filterHints.finished
    }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0f0f1a] text-white">
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          animate={{ opacity: activeBackgroundLayer === "a" ? 1 : 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          style={{ backgroundImage: backgroundA }}
        />
        <motion.div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          animate={{ opacity: activeBackgroundLayer === "b" ? 1 : 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          style={{ backgroundImage: backgroundB }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(255,180,200,0.15),transparent_26%),radial-gradient(circle_at_82%_12%,rgba(196,181,253,0.12),transparent_24%),linear-gradient(180deg,rgba(9,10,20,0.2),rgba(9,10,20,0.82))]" />
      </div>

      <div className="relative z-10 flex h-screen min-h-[600px] min-w-[900px] gap-6 p-6">
        <Sidebar
          activeFilter={activeFilter}
          onFilterChange={(value) => {
            setActiveFilter(value);
            setBackgroundIndex((current) => (current + 1) % placeholderBackgrounds.length);
          }}
          onAdd={() => setModalOpen(true)}
          labels={{
            sections: t.sections,
            description: t.sidebarDescription,
            categories: t.categories,
            addGame: t.addGame,
            importExecutableAndCover: t.importExecutableAndCover,
            filters: filterItems
          }}
        />

        <main className="flex min-w-0 flex-1 flex-col rounded-[30px] border border-white/10 bg-white/[0.035] p-6 shadow-glass backdrop-blur-[22px]">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-[220px]">
              <div className="font-title text-[2.15rem] font-light tracking-[0.08em] text-white">
                {t.appTitle}
              </div>
              <div className="mt-2 flex items-center gap-3 text-sm text-white/45">
                <span>{selectedGame?.name ?? t.defaultShelf}</span>
                {selectedGameRunning ? (
                  <span className="rounded-full border border-[#ffb4c8]/25 bg-[#ffb4c8]/12 px-3 py-1 text-xs text-[#ffe1eb]">
                    {t.running}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex flex-1 items-center justify-end gap-3">
              <label className="group relative min-w-[260px] max-w-[420px] flex-1">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-white/35 transition group-focus-within:text-[#ffb4c8]">
                  {t.search}
                </span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder=" "
                  className="h-12 w-full rounded-2xl border border-white/10 bg-black/20 px-4 pl-[4.5rem] text-sm text-white outline-none transition focus:border-[#ffb4c8]/45 focus:bg-black/30"
                />
              </label>
              <div className="flex items-center rounded-2xl border border-white/10 bg-black/20 p-1">
                {(Object.keys(localeLabels) as Array<keyof typeof localeLabels>).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setLocale(key)}
                    className={`rounded-xl px-3 py-2 text-xs transition ${
                      locale === key
                        ? "bg-white/12 text-white"
                        : "text-white/50 hover:text-white"
                    }`}
                  >
                    {localeLabels[key]}
                  </button>
                ))}
              </div>
              {selectedGameRunning && selectedGame ? (
                <button
                  type="button"
                  onClick={() => void terminateGame(selectedGame.id)}
                  disabled={busyIds.includes(selectedGame.id)}
                  className="rounded-2xl border border-[#ffb4c8]/30 bg-[#ffb4c8]/12 px-4 py-3 text-sm text-white transition hover:border-[#ffb4c8]/45 hover:bg-[#ffb4c8]/18 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t.endGame}
                </button>
              ) : null}
              <div className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-white/50">
                {filteredGames.length} / {games.length}
              </div>
              <div className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-white/50">
                {t.runningCounter} {runningIds.length}
              </div>
              <button
                type="button"
                className="rounded-full border border-white/10 bg-black/20 p-3 text-white/60 transition hover:border-white/20 hover:text-white"
                title={t.settings}
              >
                <span className="block h-4 w-4 rotate-45 rounded-sm border border-current" />
              </button>
            </div>
          </div>

          <div className="scroll-fade min-h-0 flex-1 overflow-y-auto pr-1">
            <GameGrid
              games={filteredGames}
              hoveredGame={hoveredGame}
              busyIds={busyIds}
              runningIds={runningIds}
              selectedId={selectedGame?.id ?? null}
              emptyMessage={emptyMessage}
              onHover={(game) => {
                setHoveredGame(game);
                if (game) {
                  setSelectedId(game.id);
                }
              }}
              onLaunch={async (id) => {
                setSelectedId(id);
                await launchGame(id);
              }}
              onTerminate={terminateGame}
              onRename={updateGameName}
              onStatusChange={updateStatus}
              onDelete={deleteGame}
              labels={{
                running: t.running,
                manage: t.manage,
                endGame: t.endGame,
                deleteGame: t.deleteGame,
                renameGame: t.renameGame,
                useDefaultName: t.useDefaultName,
                renamePrompt: t.renamePrompt,
                markAs: t.markAs,
                statusLabels: t.statusLabels
              }}
            />
          </div>
        </main>
      </div>

      <AddGameModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={addGame}
        labels={{
          addGameTitle: t.addGameTitle,
          close: t.close,
          gameName: t.gameName,
          gameNamePlaceholder: t.gameNamePlaceholder,
          gameNameHint: t.gameNameHint,
          executable: t.executable,
          executablePlaceholder: t.executablePlaceholder,
          browse: t.browse,
          coverImage: t.coverImage,
          coverOptionalHint: t.coverOptionalHint,
          autoCover: t.autoCover,
          autoCoverWithExe: t.autoCoverWithExe,
          autoCoverEmptyExe: t.autoCoverEmptyExe,
          selectCover: t.selectCover,
          useDefaultIcon: t.useDefaultIcon,
          cancel: t.cancel,
          saveGame: t.saveGame,
          saving: t.saving
        }}
      />
      <Toast items={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
