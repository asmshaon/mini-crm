"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, X, User, Loader2 } from "lucide-react";

interface PhotoUploadProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  isUploading?: boolean;
  onUpload: (file: File) => Promise<string>;
  label?: string;
}

export function PhotoUpload({
  value,
  onChange,
  disabled = false,
  isUploading = false,
  onUpload,
  label = "Photo",
}: PhotoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayUrl = preview || value;

  const processFile = useCallback(
    async (file: File) => {
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
      if (!validTypes.includes(file.type)) {
        throw new Error("Please upload a JPEG, PNG, GIF, or WebP image");
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error("File size must be less than 5MB");
      }

      setPreview(URL.createObjectURL(file));
      const url = await onUpload(file);
      setPreview("");
      onChange(url);
    },
    [onUpload, onChange]
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await processFile(file);
    } catch (err) {
      setPreview("");
      throw err;
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || isUploading) return;

    const file = e.dataTransfer.files[0];
    if (!file) return;

    try {
      await processFile(file);
    } catch (err) {
      setPreview("");
      throw err;
    }
  };

  const handleRemove = () => {
    setPreview("");
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    if (!disabled && !isUploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  if (displayUrl) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="relative inline-block group">
          <div className="relative overflow-hidden rounded-2xl border-2 border-gray-200 shadow-sm transition-shadow group-hover:shadow-md">
            <img
              src={displayUrl}
              alt="Photo preview"
              className="h-40 w-40 object-cover"
            />
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            )}
          </div>
          {!isUploading && !disabled && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-all hover:bg-red-600 hover:scale-110"
              aria-label="Remove photo"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {!disabled && (
          <button
            type="button"
            onClick={handleClick}
            disabled={isUploading}
            className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {isUploading ? "Uploading..." : "Change photo"}
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled || isUploading}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative flex h-40 w-full max-w-[280px] cursor-pointer flex-col items-center
          justify-center rounded-2xl border-2 border-dashed transition-all
          ${isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
          }
          ${disabled || isUploading ? "cursor-not-allowed opacity-60" : ""}
        `}
      >
        {isUploading ? (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            <p className="mt-3 text-sm font-medium text-gray-700">Uploading photo...</p>
          </>
        ) : (
          <>
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200">
              {displayUrl ? (
                <img src={displayUrl} alt="" className="h-full w-full rounded-full object-cover" />
              ) : (
                <User className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm font-medium text-gray-700">
                {isDragging ? "Drop photo here" : "Upload customer photo"}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Drag & drop or click to browse
              </p>
              <p className="mt-1 text-xs text-gray-400">
                JPEG, PNG, GIF, WebP • Max 5MB
              </p>
            </div>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled || isUploading}
        />
      </div>
    </div>
  );
}
