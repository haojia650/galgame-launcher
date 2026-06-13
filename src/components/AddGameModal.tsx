import { useEffect, useMemo, useState, type DragEventHandler } from "react";
import { convertFileSrc } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { AnimatePresence, motion } from "framer-motion";
import type { AddGamePayload } from "../types";

interface AddGameModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: AddGamePayload) => Promise<unknown>;
  labels: {
    addGameTitle: string;
    close: string;
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
    cancel: string;
    saveGame: string;
    saving: string;
  };
}

const isImageFile = (value: string) =>
  /\.(png|jpe?g|webp|bmp)$/i.test(value.toLowerCase());

export function AddGameModal({
  open: isOpen,
  onClose,
  onSubmit,
  labels
}: AddGameModalProps) {
  const [name, setName] = useState("");
  const [exePath, setExePath] = useState("");
  const [coverSrc, setCoverSrc] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setName("");
      setExePath("");
      setCoverSrc("");
      setSubmitting(false);
      setDragging(false);
    }
  }, [isOpen]);

  const preview = useMemo(() => {
    if (!coverSrc) {
      return "";
    }
    return convertFileSrc(coverSrc);
  }, [coverSrc]);

  const pickExecutable = async () => {
    const selected = await open({
      multiple: false,
      filters: [{ name: "Executable", extensions: ["exe"] }]
    });
    if (typeof selected === "string") {
      setExePath(selected);
      if (!name) {
        const base = selected.split(/[\\/]/).pop() ?? "";
        setName(base.replace(/\.exe$/i, ""));
      }
    }
  };

  const pickCover = async () => {
    const selected = await open({
      multiple: false,
      filters: [
        { name: "Image", extensions: ["png", "jpg", "jpeg", "webp", "bmp"] }
      ]
    });
    if (typeof selected === "string") {
      setCoverSrc(selected);
    }
  };

  const handleDrop: DragEventHandler<HTMLLabelElement> = (event) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0] as (File & { path?: string }) | undefined;
    const filePath = file?.path;
    if (filePath && isImageFile(filePath)) {
      setCoverSrc(filePath);
    }
  };

  const save = async () => {
    if (!exePath) {
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim() || null,
        exePath,
        coverSrc: coverSrc || null
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-6 backdrop-blur-[4px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 14 }}
            transition={{
              duration: 0.3,
              ease: [0.22, 1, 0.36, 1]
            }}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-[560px] rounded-[28px] border border-white/10 bg-[rgba(17,18,31,0.92)] p-7 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.35em] text-white/30">
                  Add Game
                </div>
                <h2 className="mt-2 font-title text-3xl font-light text-white">
                  {labels.addGameTitle}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/65 transition hover:text-white"
              >
                {labels.close}
              </button>
            </div>

            <div className="space-y-5">
              <label className="block">
                <div className="mb-2 text-sm text-white/72">{labels.gameName}</div>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder={labels.gameNamePlaceholder}
                  className="h-12 w-full rounded-2xl border border-white/10 bg-black/25 px-4 text-sm text-white outline-none transition focus:border-[#ffb4c8]/45 focus:bg-black/35"
                />
                <div className="mt-2 text-xs text-white/40">{labels.gameNameHint}</div>
              </label>

              <div>
                <div className="mb-2 text-sm text-white/72">{labels.executable}</div>
                <div className="flex gap-3">
                  <input
                    value={exePath}
                    readOnly
                    placeholder={labels.executablePlaceholder}
                    className="h-12 flex-1 rounded-2xl border border-white/10 bg-black/25 px-4 text-sm text-white/80 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => void pickExecutable()}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white transition hover:border-white/20 hover:bg-white/10"
                  >
                    {labels.browse}
                  </button>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-white/72">
                  <span>{labels.coverImage}</span>
                  <span className="text-xs text-white/38">{labels.coverOptionalHint}</span>
                </div>
                <label
                  onClick={() => void pickCover()}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  className={`flex min-h-[220px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[24px] border border-dashed transition ${
                    dragging
                      ? "border-[#ffb4c8]/60 bg-[#ffb4c8]/8"
                      : "border-white/10 bg-white/[0.035] hover:border-white/20 hover:bg-white/[0.06]"
                  }`}
                >
                  {preview ? (
                    <img
                      src={preview}
                      alt="cover preview"
                      className="h-[220px] w-full object-cover"
                    />
                  ) : (
                    <div className="flex max-w-[320px] flex-col items-center text-center">
                      <div className="rounded-full border border-[#ffb4c8]/20 bg-[#ffb4c8]/10 px-3 py-1 text-xs uppercase tracking-[0.28em] text-[#ffcedb]">
                        {labels.autoCover}
                      </div>
                      <div className="mt-4 text-base text-white/78">
                        {exePath ? labels.autoCoverWithExe : labels.autoCoverEmptyExe}
                      </div>
                      <div className="mt-2 text-xs uppercase tracking-[0.28em] text-white/35">
                        PNG / JPG / WEBP
                      </div>
                    </div>
                  )}
                </label>
                <div className="mt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={() => void pickCover()}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:border-white/20 hover:bg-white/10"
                  >
                    {labels.selectCover}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCoverSrc("")}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white/75 transition hover:border-white/20 hover:text-white"
                  >
                    {labels.useDefaultIcon}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/75 transition hover:bg-white/10 hover:text-white"
              >
                {labels.cancel}
              </button>
              <button
                type="button"
                onClick={() => void save()}
                disabled={submitting || !exePath}
                className="rounded-2xl border border-[#ffb4c8]/30 bg-gradient-to-r from-[#ffb4c8]/25 to-[#c4b5fd]/25 px-6 py-3 text-sm text-white transition hover:from-[#ffb4c8]/35 hover:to-[#c4b5fd]/35 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submitting ? labels.saving : labels.saveGame}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
