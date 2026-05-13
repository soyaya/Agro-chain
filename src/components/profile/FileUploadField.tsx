'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Upload as UploadIcon, X, Dot, CheckCircle2, Trash2, Loader, FileUp } from 'lucide-react';
import { cn } from '~/lib/utils';

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
  accept = '.pdf,.jpg,.jpeg,.png',
  maxSizeMB = 5,
  required = false,
  isOpen,
  onToggle,
  onFileChange,
  onUploadComplete,
}: FileUploadFieldProps) {
  const [state, setState] = useState<'idle' | 'uploading' | 'success'>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openFileDialog = () => fileInputRef.current?.click();

  const formattedTypes = accept
    .split(',')
    .map((ext) => ext.replace('.', '').toUpperCase())
    .join(', ');

  const formatSize = (bytes: number) => (bytes / 1024).toFixed(0) + 'KB';

  const reset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setState('idle');
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

      setState('uploading');
      let pct = 0;
      const interval = setInterval(() => {
        pct += Math.random() * 15 + 5;
        if (pct >= 100) {
          clearInterval(interval);
          setProgress(100);
          setTimeout(() => {
            setState('success');
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
              if (state !== 'uploading') onToggle();
            }}
            className={cn(
              'relative cursor-pointer overflow-hidden rounded-lg border border-(--border-input) shadow-sm transition-all duration-300 ease-in-out hover:shadow-md',
              state === 'success' ? 'bg-green-50/40' : 'bg-(--white)',
            )}
          >
            <div className="flex flex-col gap-(--gap-xl) p-(--space-base)">
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-(--gap-sm)">
                  <span className="flex h-(--space-3xl) w-(--space-3xl) shrink-0 items-center justify-center rounded-lg bg-blue-50">
                    <FileUp size={20} className="text-blue-600" />
                  </span>
                  <div className="flex flex-col justify-center gap-0.5">
                    <p className="font-roboto-slab text-base font-medium text-(--heading-colour)">
                      {label}
                      {required && <span className="text-red-500 ml-1">*</span>}
                    </p>
                    <div className="flex h-4 items-center">
                      {state === 'idle' && (
                        <span className="font-roboto-slab text-xs text-(--text-colour)">
                          No file selected
                        </span>
                      )}
                      {state === 'uploading' && file && (
                        <div className="flex items-center gap-2 text-xs text-(--text-colour)">
                          <span>
                            {formatSize((file.size * progress) / 100)} of {formatSize(file.size)}
                          </span>
                          <span className="flex items-center gap-(--gap-sm)">
                            <Loader
                              strokeWidth={3}
                              size={12}
                              className="animate-spin text-(--theme-green-dark)"
                            />
                            <span className="font-roboto-slab">Uploading...</span>
                          </span>
                        </div>
                      )}
                      {state === 'success' && file && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-roboto-slab text-(--text-colour)">
                            {formatSize(file.size)}
                          </span>
                          <Dot className="text-(--text-colour)" />
                          <span className="flex items-center gap-1 font-medium text-green-600">
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
                  {state === 'success' ? (
                    <button
                      type="button"
                      onClick={reset}
                      className="p-(--space-sm) text-gray-500 cursor-pointer ease-in-out transition-all duration-300 hover:text-(--error-red)"
                    >
                      <Trash2 size={18} />
                    </button>
                  ) : (
                    state !== 'uploading' && (
                      <div className="flex items-center gap-(--gap-sm) rounded-xl border border-(--border-input) bg-gray-50 px-(--space-sm) py-1.5 text-(--heading-colour) shadow-sm">
                        <UploadIcon size={18} strokeWidth={3} />
                        <span className="font-roboto-slab text-sm font-semibold">Upload</span>
                      </div>
                    )
                  )}
                </div>
              </div>
              {state === 'uploading' && (
                <div className="relative">
                  <div className="absolute bottom-0 left-0 h-1 w-full rounded-full bg-gray-200">
                    <motion.div
                      className="h-full rounded-full bg-(--theme-green-dark)"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ ease: 'linear' }}
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
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex flex-col gap-(--space-sm) rounded-xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-ubuntu font-semibold text-(--heading-colour)">
                Upload {label}
              </h3>
              <button
                type="button"
                onClick={onToggle}
                className="cursor-pointer text-(--text-colour) ease-in-out transition-all duration-300 hover:text-(--black)"
              >
                <X size={16} />
              </button>
            </div>
            <div
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={openFileDialog}
              className="cursor-pointer rounded-lg border-2 border-dashed border-(--border-input) bg-(--white) p-(--space-3xl) text-center shadow-sm ease-in-out transition-all duration-300 hover:border-gray-400"
            >
              {state === 'uploading' ? (
                <div className="flex flex-col gap-(--gap-md) py-(--space-base)">
                  <Loader className="mx-auto h-8 w-8 animate-spin text-(--theme-green-dark)" />
                  <p className="font-roboto-slab text-base font-medium">
                    Uploading... {Math.round(progress)}%
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-(--gap-md) bg-(--white)">
                  <FileUp className="mx-auto h-10 w-10 text-(--text-colour)" />
                  <div className="flex flex-col gap-(--gap-md)">
                    <p className="font-roboto-slab text-sm font-medium text-(--heading-colour)">
                      Browse for a file or drag &amp; drop it here
                    </p>
                    <p className="font-roboto-slab text-xs text-(--text-colour)">
                      {formattedTypes} formats, up to {maxSizeMB}MB
                    </p>
                  </div>
                  <button
                    type="button"
                    className="mx-auto h-12 w-full max-w-40 rounded-full border border-(--border-gray) bg-(--theme-green-dark) font-ubuntu font-bold text-(--white) shadow-sm cursor-pointer ease-in-out transition-all duration-300 hover:opacity-90"
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
      {error && <p className="font-roboto-slab text-xs text-(--error-red)">{error}</p>}
    </div>
  );
}
