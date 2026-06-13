import { useCallback, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import type {
  AddGamePayload,
  Game,
  GameProcessEvent,
  GameStatus,
  RunningGameInfo,
  ToastItem
} from "../types";

type ToastInput = Omit<ToastItem, "id">;

interface UseGamesMessages {
  loadGamesFailed: string;
  gameClosed: string;
  gameAdded: string;
  statusUpdated: string;
  updateStatusFailed: string;
  gameRemoved: string;
  deleteGameFailed: string;
  gameAlreadyRunning: string;
  gameLaunched: string;
  launchGameFailed: string;
  noRunningProcess: string;
  terminateSent: string;
  terminateGameFailed: string;
  gameRenamed: string;
  gameNameReset: string;
  renameGameFailed: string;
}

const sortGames = (games: Game[]) =>
  [...games].sort((a, b) => b.added_date.localeCompare(a.added_date));

export function useGames(messages: UseGamesMessages) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyIds, setBusyIds] = useState<string[]>([]);
  const [runningIds, setRunningIds] = useState<string[]>([]);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const markBusy = useCallback((id: string, busy: boolean) => {
    setBusyIds((current) => {
      if (busy) {
        return current.includes(id) ? current : [...current, id];
      }
      return current.filter((item) => item !== id);
    });
  }, []);

  const pushToast = useCallback((toast: ToastInput) => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, ...toast }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 3000);
  }, []);

  const loadGames = useCallback(async () => {
    setLoading(true);
    try {
      const result = await invoke<Game[]>("get_games");
      setGames(sortGames(result));
    } catch (error) {
      console.error(error);
      pushToast({ message: messages.loadGamesFailed, kind: "error" });
    } finally {
      setLoading(false);
    }
  }, [messages.loadGamesFailed, pushToast]);

  useEffect(() => {
    void loadGames();
  }, [loadGames]);

  useEffect(() => {
    void invoke<RunningGameInfo[]>("get_running_games")
      .then((runningGames) => {
        setRunningIds(runningGames.map((item) => item.id));
      })
      .catch((error) => {
        console.error(error);
      });

    const unlistenPromise = listen<GameProcessEvent>(
      "game-process-changed",
      ({ payload }) => {
        if (payload.running) {
          setRunningIds((current) =>
            current.includes(payload.id) ? current : [...current, payload.id]
          );
          return;
        }

        let wasRunning = false;
        setRunningIds((current) => {
          wasRunning = current.includes(payload.id);
          return current.filter((item) => item !== payload.id);
        });

        if (wasRunning) {
          pushToast({ message: messages.gameClosed, kind: "info" });
        }
      }
    );

    return () => {
      void unlistenPromise.then((unlisten) => unlisten());
    };
  }, [messages.gameClosed, pushToast]);

  const addGame = useCallback(
    async (payload: AddGamePayload) => {
      const game = await invoke<Game>("add_game", {
        exePath: payload.exePath,
        name: payload.name ?? null,
        coverSrc: payload.coverSrc ?? null
      });
      setGames((current) => sortGames([...current, game]));
      pushToast({ message: messages.gameAdded, kind: "success" });
      return game;
    },
    [messages.gameAdded, pushToast]
  );

  const updateStatus = useCallback(
    async (id: string, status: GameStatus) => {
      try {
        await invoke("update_game_status", { id, status });
        setGames((current) =>
          current.map((game) => (game.id === id ? { ...game, status } : game))
        );
        pushToast({ message: messages.statusUpdated, kind: "success" });
      } catch (error) {
        console.error(error);
        pushToast({ message: messages.updateStatusFailed, kind: "error" });
      }
    },
    [messages.statusUpdated, messages.updateStatusFailed, pushToast]
  );

  const updateGameName = useCallback(
    async (id: string, name: string | null) => {
      try {
        const game = await invoke<Game>("update_game_name", { id, name });
        setGames((current) =>
          current.map((item) => (item.id === id ? game : item))
        );
        pushToast({
          message: name && name.trim() ? messages.gameRenamed : messages.gameNameReset,
          kind: "success"
        });
        return game;
      } catch (error) {
        console.error(error);
        pushToast({ message: messages.renameGameFailed, kind: "error" });
        throw error;
      }
    },
    [
      messages.gameNameReset,
      messages.gameRenamed,
      messages.renameGameFailed,
      pushToast
    ]
  );

  const deleteGame = useCallback(
    async (id: string) => {
      try {
        await invoke("delete_game", { id });
        setGames((current) => current.filter((game) => game.id !== id));
        pushToast({ message: messages.gameRemoved, kind: "info" });
      } catch (error) {
        console.error(error);
        pushToast({ message: messages.deleteGameFailed, kind: "error" });
      }
    },
    [messages.deleteGameFailed, messages.gameRemoved, pushToast]
  );

  const launchGame = useCallback(
    async (id: string) => {
      if (runningIds.includes(id)) {
        pushToast({ message: messages.gameAlreadyRunning, kind: "info" });
        return;
      }
      markBusy(id, true);
      try {
        const message = await invoke<string>("launch_game", { id });
        pushToast({ message: message || messages.gameLaunched, kind: "success" });
      } catch (error) {
        console.error(error);
        pushToast({ message: messages.launchGameFailed, kind: "error" });
        throw error;
      } finally {
        markBusy(id, false);
      }
    },
    [
      markBusy,
      messages.gameAlreadyRunning,
      messages.gameLaunched,
      messages.launchGameFailed,
      pushToast,
      runningIds
    ]
  );

  const terminateGame = useCallback(
    async (id: string) => {
      if (!runningIds.includes(id)) {
        pushToast({ message: messages.noRunningProcess, kind: "info" });
        return;
      }
      markBusy(id, true);
      try {
        const message = await invoke<string>("terminate_game", { id });
        pushToast({ message: message || messages.terminateSent, kind: "success" });
      } catch (error) {
        console.error(error);
        pushToast({ message: messages.terminateGameFailed, kind: "error" });
        throw error;
      } finally {
        markBusy(id, false);
      }
    },
    [
      markBusy,
      messages.noRunningProcess,
      messages.terminateGameFailed,
      messages.terminateSent,
      pushToast,
      runningIds
    ]
  );

  return {
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
    dismissToast: (id: string) =>
      setToasts((current) => current.filter((item) => item.id !== id)),
    reload: loadGames
  };
}
