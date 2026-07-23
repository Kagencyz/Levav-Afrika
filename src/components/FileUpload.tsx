// FileUpload.tsx — S3 presigned URL upload with drag-and-drop
import { useState, useCallback, useRef } from 'react';
import { Upload, X, File, Image, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
interface FileUploadProps {
  onUpload: (url: string) => void;
  accept?: string;
  maxSize?: number; // in MB
}

export function FileUpload({
  onUpload,
  accept = 'image/*,.pdf',
  maxSize = 5,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      setError(null);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) handleFile(droppedFile);
    },
    []
  );

  const handleFile = (selectedFile: File) => {
    setError(null);

    // Validate file size
    if (selectedFile.size > maxSize * 1024 * 1024) {
      setError(`File too large. Maximum size is ${maxSize}MB.`);
      return;
    }

    // Validate file type (images + PDFs)
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'application/pdf',
    ];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Invalid file type. Supports images and PDFs only.');
      return;
    }

    setFile(selectedFile);
    uploadToS3(selectedFile);
  };

  const uploadToS3 = async (selectedFile: File) => {
    setUploading(true);
    setProgress(0);

    try {
      const ext = selectedFile.name.split('.').pop() || '';
      const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      // 1. Get presigned URL from tRPC endpoint via direct HTTP call
      const searchParams = new URLSearchParams({
        input: JSON.stringify({ key, contentType: selectedFile.type }),
      });
      const res = await fetch(`/api/trpc/upload.getPresignedUrl?${searchParams}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token') || ''}`,
        },
      });

      if (!res.ok) throw new Error('Failed to get presigned URL');
      const result = await res.json();
      const presignedUrl = result.result.data.url;

      // 2. Upload file directly to S3 via PUT
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', presignedUrl, true);
      xhr.setRequestHeader('Content-Type', selectedFile.type);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const pct = Math.round((event.loaded / event.total) * 100);
          setProgress(pct);
        }
      };

      await new Promise<void>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.send(selectedFile);
      });

      // 3. Extract the public URL from the presigned URL (remove query params)
      const publicUrl = presignedUrl.split('?')[0];

      setUploading(false);
      setUploaded(true);
      onUpload(publicUrl);
    } catch (err: any) {
      setUploading(false);
      setError(err.message || 'Upload failed. Please try again.');
    }
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setUploaded(false);
    setProgress(0);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const getFileIcon = () => {
    if (!file) return <Upload size={32} className="text-white/40" />;
    if (file.type.startsWith('image/')) return <Image size={32} className="text-[#C6FF34]" />;
    return <File size={32} className="text-[#C6FF34]" />;
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer relative ${
        isDragging
          ? 'border-[#C6FF34] bg-[#C6FF34]/5'
          : error
          ? 'border-red-500/50 bg-red-500/5 hover:border-red-400'
          : 'border-white/20 hover:border-white/40'
      }`}
    >
      {/* Clear button */}
      {(file || uploaded) && (
        <button
          onClick={clearFile}
          className="absolute top-3 right-3 p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
        >
          <X size={14} className="text-white" />
        </button>
      )}

      <AnimatePresence mode="wait">
        {uploaded ? (
          <motion.div
            key="uploaded"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="flex flex-col items-center gap-2"
          >
            <CheckCircle size={32} className="text-[#C6FF34]" />
            <p className="text-white text-sm truncate max-w-[200px]">{file?.name}</p>
            <p className="text-[#C6FF34] text-xs font-medium">Upload complete</p>
          </motion.div>
        ) : uploading ? (
          <motion.div
            key="uploading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="relative w-10 h-10">
              <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="3"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  stroke="#C6FF34"
                  strokeWidth="3"
                  strokeDasharray={`${progress * 0.94} 100`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-medium">
                {progress}%
              </span>
            </div>
            <p className="text-white/60 text-sm">Uploading {file?.name}...</p>
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-2"
          >
            {getFileIcon()}
            <p className="text-red-400 text-sm font-medium">{error}</p>
            <p className="text-white/40 text-xs">Click or drag to try again</p>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3"
          >
            <Upload size={32} className="text-white/40" />
            <p className="text-white text-sm font-medium">
              Drag & drop or click to upload
            </p>
            <p className="text-white/40 text-xs">
              Supports images and PDFs up to {maxSize}MB
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(e) => {
          e.stopPropagation();
          e.target.files?.[0] && handleFile(e.target.files[0]);
        }}
        className="hidden"
      />
    </div>
  );
}
