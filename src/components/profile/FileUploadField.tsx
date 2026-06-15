"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload as UploadIcon,
  X,
  Dot,
  CheckCircle2,
  Trash2,
  Loader,
  FileUp,
} from "lucide-react";
import { cn } from "~/lib/utils";

type FileUploadFieldProps = {
  label: string;
  accept?: string;
  maxSizeMB?: number;
  required?: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onFileChange?: (file: File | null) => void;
  onUploadComplete?: (file: File) => void;
};

export function FileUploadField({
  label,
  accept = ".pdf,.jpg,.jpeg,.png",
  maxSizeMB = 5,
  required = false,
  isOpen,
  onToggle,
  onFileChange,
  onUploadComplete,
}: FileUploadFieldProps) {
  const [state, setState] = useState<"idle" | "uploading" | "success">("idle");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openFileDialog = () => fileInputRef.current?.click();

  const formattedTypes = accept
    .split(",")
    .map((ext) => ext.replace(".", "").toUpperCase())
    .join(", ");

  const formatSize = (bytes: number) => (bytes / 1024).toFixed(0) + "KB";

  const reset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setState("idle");
    setFile(null);
    setProgress(0);
    setError(null);
    onFileChange?.(null);
  };

  const handleFiles = useCallback(
    (selectedFiles: FileList | null) => {
      const f = selectedFiles?.[0];
      if (!f) return;

      if (f.size > maxSizeMB * 1024 * 1024) {
        setError(`File too large (max ${maxSizeMB}MB)`);
        return;
      }

      setError(null);
      setFile(f);
      onFileChange?.(f);

      if (isOpen) onToggle();

      setState("uploading");
      let pct = 0;
      const interval = setInterval(() => {
        pct += Math.random() * 15 + 5;
        if (pct >= 100) {
          clearInterval(interval);
          setProgress(100);
          setTimeout(() => {
            setState("success");
            onUploadComplete?.(f);
          }, 400);
        } else {
          setProgress(pct);
        }
      }, 150);
    },
    [maxSizeMB, onFileChange, onUploadComplete, onToggle, isOpen],
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="flex w-full flex-col gap-(--gap-sm)">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (state !== "uploading") onToggle();
            }}
            className={cn(
              "border-input-border relative cursor-pointer overflow-hidden rounded-lg border shadow-sm transition-all duration-300 ease-in-out hover:shadow-md",
              state === "success" ? "bg-green-tint/40" : "bg-(--white)",
            )}
          >
            <div className="flex flex-col gap-(--gap-xl) p-(--space-base)">
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-(--gap-sm)">
                  <span className="flex h-(--space-3xl) w-(--space-3xl) shrink-0 items-center justify-center rounded-lg bg-blue-50">
                    <FileUp size={20} className="text-blue-600" />
                  </span>
                  <div className="flex flex-col justify-center gap-0.5">
                    <p className="font-roboto-slab text-heading-colour text-base font-medium">
                      {label}
                      {required && <span className="ml-1 text-red-500">*</span>}
                    </p>
                    <div className="flex h-4 items-center">
                      {state === "idle" && (
                        <span className="font-roboto-slab text-text-colour text-xs">
                          No file selected
                        </span>
                      )}
                      {state === "uploading" && file && (
                        <div className="text-text-colour flex items-center gap-2 text-xs">
                          <span>
                            {formatSize((file.size * progress) / 100)} of{" "}
                            {formatSize(file.size)}
                          </span>
                          <span className="flex items-center gap-(--gap-sm)">
                            <Loader
                              strokeWidth={3}
                              size={12}
                              className="text-theme-green-dark animate-spin"
                            />
                            <span className="font-roboto-slab">
                              Uploading...
                            </span>
                          </span>
                        </div>
                      )}
                      {state === "success" && file && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-roboto-slab text-text-colour">
                            {formatSize(file.size)}
                          </span>
                          <Dot className="text-text-colour" />
                          <span className="text-theme-green-dark flex items-center gap-1 font-medium">
                            <CheckCircle2
                              fill="currentColor"
                              stroke="white"
                              strokeWidth={3}
                              size={16}
                            />
                            <span className="font-roboto-slab">Uploaded</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-(--gap-md)">
                  {state === "success" ? (
                    <button
                      type="button"
                      onClick={reset}
                      className="hover:text-error-red text-muted-text cursor-pointer p-(--space-sm) transition-all duration-300 ease-in-out"
                    >
                      <Trash2 size={18} />
                    </button>
                  ) : (
                    state !== "uploading" && (
                      <div className="text-heading-colour border-input-border bg-gray-bg flex items-center gap-(--gap-sm) rounded-xl border px-(--space-sm) py-1.5 shadow-sm">
                        <UploadIcon size={18} strokeWidth={3} />
                        <span className="font-roboto-slab text-sm font-semibold">
                          Upload
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
              {state === "uploading" && (
                <div className="relative">
                  <div className="bg-gray-border absolute bottom-0 left-0 h-1 w-full rounded-full">
                    <motion.div
                      className="bg-theme-green-dark h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ ease: "linear" }}
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex flex-col gap-(--space-sm) rounded-xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-ubuntu text-heading-colour font-semibold">
                Upload {label}
              </h3>
              <button
                type="button"
                onClick={onToggle}
                className="text-text-colour cursor-pointer transition-all duration-300 ease-in-out hover:text-(--black)"
              >
                <X size={16} />
              </button>
            </div>
            <div
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={openFileDialog}
              className="border-input-border hover:border-gray-border cursor-pointer rounded-lg border-2 border-dashed bg-(--white) p-(--space-3xl) text-center shadow-sm transition-all duration-300 ease-in-out"
            >
              {state === "uploading" ? (
                <div className="flex flex-col gap-(--gap-md) py-(--space-base)">
                  <Loader className="text-theme-green-dark mx-auto h-8 w-8 animate-spin" />
                  <p className="font-roboto-slab text-base font-medium">
                    Uploading... {Math.round(progress)}%
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-(--gap-md) bg-(--white)">
                  <FileUp className="text-text-colour mx-auto h-10 w-10" />
                  <div className="flex flex-col gap-(--gap-md)">
                    <p className="font-roboto-slab text-heading-colour text-sm font-medium">
                      Browse for a file or drag &amp; drop it here
                    </p>
                    <p className="font-roboto-slab text-text-colour text-xs">
                      {formattedTypes} formats, up to {maxSizeMB}MB
                    </p>
                  </div>
                  <button
                    type="button"
                    className="border-gray-border font-ubuntu bg-theme-green-dark mx-auto h-12 w-full max-w-40 cursor-pointer rounded-full border font-bold text-(--white) shadow-sm transition-all duration-300 ease-in-out hover:opacity-90"
                  >
                    Browse for a file
                  </button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={(e) => handleFiles(e.target.files)}
                className="hidden"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {error && (
        <p className="font-roboto-slab text-error-red text-xs">{error}</p>
      )}
    </div>
  );
}
