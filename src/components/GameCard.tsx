import { useMemo, useState } from "react";
import { convertFileSrc } from "@tauri-apps/api/core";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import type { Game, GameStatus } from "../types";

interface GameCardProps {
  game: Game;
  isBusy: boolean;
  isRunning: boolean;
  isSelected: boolean;
  dimmed: boolean;
  onHover: (game: Game | null) => void;
  onLaunch: (id: string) => Promise<void>;
  onTerminate: (id: string) => Promise<void>;
  onRename: (id: string, name: string | null) => Promise<unknown>;
  onStatusChange: (id: string, status: GameStatus) => void;
  onDelete: (id: string) => void;
  labels: {
    running: string;
    manage: string;
    endGame: string;
    deleteGame: string;
    renameGame: string;
    useDefaultName: string;
    renamePrompt: string;
    markAs: string;
    statusLabels: Record<GameStatus, string>;
  };
}

const jellyTransition = {
  duration: 0.35,
  ease: [0.34, 1.56, 0.64, 1] as const
};

export function GameCard({
  game,
  isBusy,
  isRunning,
  isSelected,
  dimmed,
  onHover,
  onLaunch,
  onTerminate,
  onRename,
  onStatusChange,
  onDelete,
  labels
}: GameCardProps) {
  const controls = useAnimation();
  const [menuOpen, setMenuOpen] = useState(false);

  const coverSrc = useMemo(() => {
    if (game.cover_path.startsWith("http")) {
      return game.cover_path;
    }
    return convertFileSrc(game.cover_path);
  }, [game.cover_path]);

  const hasCustomName = game.name !== game.default_name;

  const runLaunchSequence = async () => {
    if (isBusy || isRunning) {
      return;
    }
    await controls.start({
      scale: 0.92,
      rotate: 0,
      transition: { duration: 0.03 }
    });
    await controls.start({
      scale: 1.04,
      rotate: Math.random() > 0.5 ? 1 : -1,
      transition: { duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }
    });
    await controls.start({
      scale: 1,
      rotate: 0,
      transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] }
    });
    await onLaunch(game.id);
  };

  return (
    <motion.div
      layout
      layoutId={game.id}
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{
        opacity: dimmed ? 0.18 : 1,
        y: 0,
        scale: dimmed ? 0.96 : 1
      }}
      exit={{ opacity: 0, y: 20, scale: 0.97 }}
      transition={{
        layout: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
        opacity: { duration: 0.25 },
        y: { duration: 0.25 }
      }}
      className="relative"
      onMouseEnter={() => onHover(game)}
      onMouseLeave={() => onHover(null)}
    >
      <motion.div
        animate={controls}
        whileHover={{
          y: -6,
          scale: 1.03,
          boxShadow:
            "0 18px 32px rgba(0,0,0,0.5), 0 0 28px rgba(255,180,200,0.12)",
          transition: jellyTransition
        }}
        onClick={() => void runLaunchSequence()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            void runLaunchSequence();
          }
        }}
        role="button"
        tabIndex={0}
        className={`group card-glow relative flex w-full overflow-hidden rounded-[12px] border bg-[rgba(255,255,255,0.05)] text-left shadow-card backdrop-blur-xl ${
          isSelected
            ? "border-white/15 ring-1 ring-[#ffb4c8]/30"
            : "border-[rgba(255,255,255,0.05)]"
        }`}
      >
        <div className="absolute inset-0 z-0 rounded-[12px] opacity-0 transition duration-300 group-hover:opacity-100 group-hover:shadow-[inset_0_0_40px_rgba(255,180,200,0.08)]" />
        <div className="relative z-10 flex w-full flex-col">
          <div className="relative h-[240px] w-full overflow-hidden">
            <img
              src={coverSrc}
              alt={game.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
              draggable={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
            <div className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-[11px] text-white/70 backdrop-blur-md">
              {labels.statusLabels[game.status]}
            </div>
            {isRunning ? (
              <div className="absolute left-3 top-12 rounded-full border border-[#ffb4c8]/30 bg-[#ffb4c8]/18 px-2.5 py-1 text-[11px] text-[#ffe2ea] backdrop-blur-md">
                {labels.running}
              </div>
            ) : null}
            <button
              type="button"
              className="absolute right-3 top-3 rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-[11px] text-white/70 backdrop-blur-md transition hover:border-white/20 hover:text-white"
              onClick={(event) => {
                event.stopPropagation();
                setMenuOpen((value) => !value);
              }}
            >
              {labels.manage}
            </button>
          </div>
          <div className="px-4 pb-3 pt-2">
            <div className="truncate text-center text-sm text-[rgba(255,255,255,0.9)]">
              {game.name}
            </div>
            {isRunning ? (
              <div className="mt-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-[#ffd7e3]">
                  <span className="h-2 w-2 rounded-full bg-[#ffb4c8] shadow-[0_0_12px_rgba(255,180,200,0.8)]" />
                  {labels.running}
                </div>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    void onTerminate(game.id);
                  }}
                  disabled={isBusy}
                  className="rounded-full border border-[#ffb4c8]/25 bg-[#ffb4c8]/12 px-3 py-1 text-xs text-white transition hover:border-[#ffb4c8]/45 hover:bg-[#ffb4c8]/18 disabled:opacity-50"
                >
                  {labels.endGame}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute right-3 top-14 z-30 w-[190px] rounded-2xl border border-white/10 bg-[#121320]/90 p-2 shadow-glass backdrop-blur-xl"
          >
            <button
              type="button"
              className="mb-1 w-full rounded-xl px-3 py-2 text-left text-sm text-white/70 transition hover:bg-white/5 hover:text-white"
              onClick={(event) => {
                event.stopPropagation();
                setMenuOpen(false);
                const nextName = window.prompt(labels.renamePrompt, game.name);
                if (nextName !== null) {
                  void onRename(game.id, nextName);
                }
              }}
            >
              {labels.renameGame}
            </button>
            {hasCustomName ? (
              <button
                type="button"
                className="mb-1 w-full rounded-xl px-3 py-2 text-left text-sm text-white/70 transition hover:bg-white/5 hover:text-white"
                onClick={(event) => {
                  event.stopPropagation();
                  setMenuOpen(false);
                  void onRename(game.id, null);
                }}
              >
                {labels.useDefaultName}
              </button>
            ) : null}
            {(["unplayed", "playing", "finished"] as const).map((status) => (
              <button
                key={status}
                type="button"
                className={`mb-1 w-full rounded-xl px-3 py-2 text-left text-sm transition last:mb-0 ${
                  game.status === status
                    ? "bg-white/10 text-white"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
                onClick={(event) => {
                  event.stopPropagation();
                  setMenuOpen(false);
                  onStatusChange(game.id, status);
                }}
              >
                {labels.markAs} {labels.statusLabels[status]}
              </button>
            ))}
            <button
              type="button"
              className="mt-2 w-full rounded-xl px-3 py-2 text-left text-sm text-red-200 transition hover:bg-red-400/10 hover:text-red-100"
              onClick={(event) => {
                event.stopPropagation();
                setMenuOpen(false);
                onDelete(game.id);
              }}
            >
              {labels.deleteGame}
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
