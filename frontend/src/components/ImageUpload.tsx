import React, { useState, useRef } from "react";
import { Upload, X, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { api } from "../services/api";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  label = "Upload Reference Image (Optional)"
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);

    // Validate type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setError("Please select a valid image file (JPG, JPEG, PNG, or WEBP).");
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size exceeds 5 MB. Please upload a smaller photo.");
      return;
    }

    setIsUploading(true);
    try {
      const res = await api.uploadCustomReference(file);
      if (res.success && res.url) {
        onChange(res.url);
      } else {
        throw new Error("Upload failed. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    onChange("");
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <label className="form-label">{label}</label>

      {value ? (
        <div className="relative border border-[#EADED3] rounded-2xl p-3 bg-white flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <img
              src={value}
              alt="Reference Preview"
              className="w-20 h-20 rounded-xl object-cover border border-stone-200"
            />
            <div>
              <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Reference photo uploaded
              </div>
              <p className="text-[11px] text-stone-500">
                The bakery will use this photo as design inspiration.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-sm btn-secondary text-xs flex items-center gap-1"
              disabled={isUploading}
            >
              <RefreshCw className="w-3 h-3" />
              Replace
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 rounded-full text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Remove reference image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            isUploading
              ? "border-[#8B263E] bg-[#FCECE9]/50 opacity-70"
              : "border-[#EADED3] hover:border-[#8B263E] bg-[#FDFBF7] hover:bg-[#FCECE9]/20"
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-[#FCECE9] text-[#8B263E] flex items-center justify-center mx-auto mb-3">
            {isUploading ? (
              <div className="w-5 h-5 border-2 border-[#8B263E] border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="w-5 h-5" />
            )}
          </div>
          <p className="text-sm font-semibold text-[#2B1810] mb-1">
            {isUploading ? "Uploading reference photo..." : "Click or drag & drop to upload cake design"}
          </p>
          <p className="text-xs text-stone-500">
            JPG, JPEG, PNG, or WEBP (Max 5 MB)
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        className="hidden"
      />

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-700 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
          <AlertCircle className="w-4 h-4 flex-none" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
export default ImageUpload;
