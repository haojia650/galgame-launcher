import { AnimatePresence, motion } from "framer-motion";
import type { Game, GameStatus } from "../types";
import { GameCard } from "./GameCard";

interface GameGridProps {
  games: Game[];
  hoveredGame: Game | null;
  busyIds: string[];
  runningIds: string[];
  selectedId: string | null;
  emptyMessage: string;
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

export function GameGrid({
  games,
  hoveredGame,
  busyIds,
  runningIds,
  selectedId,
  emptyMessage,
  onHover,
  onLaunch,
  onTerminate,
  onRename,
  onStatusChange,
  onDelete,
  labels
}: GameGridProps) {
  if (games.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-[28px] border border-white/10 bg-white/[0.04] text-white/45 shadow-glass backdrop-blur-xl">
        {emptyMessage}
      </div>
    );
  }

  return (
    <motion.div
      layout
      className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-5"
    >
      <AnimatePresence mode="popLayout">
        {games.map((game, index) => {
          const dimmed = Boolean(hoveredGame && hoveredGame.id !== game.id);
          return (
            <motion.div
              key={game.id}
              layout
              transition={{
                layout: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
                delay: index * 0.05
              }}
            >
              <GameCard
                game={game}
                isBusy={busyIds.includes(game.id)}
                isRunning={runningIds.includes(game.id)}
                isSelected={selectedId === game.id}
                dimmed={dimmed}
                onHover={onHover}
                onLaunch={onLaunch}
                onTerminate={onTerminate}
                onRename={onRename}
                onStatusChange={onStatusChange}
                onDelete={onDelete}
                labels={labels}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}
