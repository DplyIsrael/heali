"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Upload, Link2, Trash2 } from "lucide-react";

interface UploadedFile {
  name: string;
  size: string;
  url: string;
}

interface StepCertificatesProps {
  initialFiles: UploadedFile[];
  onNext: (files: UploadedFile[]) => void;
  onBack: () => void;
  onRemove?: (url: string) => Promise<unknown> | void;
}

export function StepCertificates({ initialFiles, onNext, onBack, onRemove }: StepCertificatesProps) {
  const [files, setFiles] = useState<UploadedFile[]>(initialFiles);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const fileList = e.target.files;
      if (!fileList || fileList.length === 0) return;
      const file = fileList[0];

      // Validate type
      const name = file.name.toLowerCase();
      const isValid = name.endsWith(".pdf") || name.endsWith(".jpg") || name.endsWith(".jpeg") ||
                      name.endsWith(".png") || name.endsWith(".webp") || name.endsWith(".heic");
      if (!isValid) {
        setError("יש לבחור קובץ PDF, JPG, PNG או WEBP");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      // Validate size
      if (file.size > 10 * 1024 * 1024) {
        setError("גודל הקובץ חייב להיות עד 10MB");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      setError("");
      setIsUploading(true);
      doUpload(file);
    } catch (err) {
      console.error("handleFileChange error:", err);
      setError("שגיאה בבחירת הקובץ");
      setIsUploading(false);
    }
  };

  const doUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload-certificate", {
        method: "POST",
        body: formData,
      });

      let data: { url?: string; error?: string };
      try {
        data = await response.json();
      } catch {
        data = { error: "שגיאת שרת" };
      }

      if (!response.ok || !data.url) {
        setError(data.error ?? "שגיאה בהעלאת הקובץ");
      } else {
        const sizeStr = file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(file.size / 1024)} KB`;

        setFiles((prev) => [...prev, { name: file.name, size: sizeStr, url: data.url! }]);
      }
    } catch (err) {
      console.error("doUpload error:", err);
      setError("שגיאה בהעלאת הקובץ. נסה שוב.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    const target = files[index];
    setFiles((prev) => prev.filter((_, i) => i !== index));
    if (target && onRemove) void onRemove(target.url);
  };

  const handleNext = () => {
    if (files.length === 0) {
      setError("יש להעלות לפחות תעודה אחת");
      return;
    }
    onNext(files);
  };

  return (
    <div className="flex flex-col">
      <h1 className="text-[36px] font-semibold leading-tight text-foreground">
        תעודות והסמכות
      </h1>
      <p className="mt-2 text-[18px] font-light text-[#666]">
        העלה את תעודות ההסמכה שלך (PDF, JPG או PNG)
      </p>

      {files.length > 0 && (
        <div className="mt-6 flex flex-col gap-3">
          {files.map((file, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-[10px] border border-border-input bg-white px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <Link2 className="h-4 w-4 text-primary" />
                <span className="text-[14px] font-medium text-primary">{file.name}</span>
                <span className="text-[14px] text-[#666]">{file.size}</span>
              </div>
              <button type="button" onClick={() => removeFile(i)} className="text-destructive hover:text-destructive/80">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="mt-6 flex items-center justify-center gap-2 rounded-[8px] border border-foreground px-6 py-3 text-[16px] transition-colors hover:bg-muted/10"
      >
        {isUploading ? <Spinner size="sm" /> : <Upload className="h-4 w-4" />}
        {isUploading ? "מעלה..." : "העלאת קובץ +"}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp,.heic"
        className="hidden"
        onChange={handleFileChange}
      />

      {error && <p className="mt-4 text-[14px] text-destructive">{error}</p>}

      <div className="mt-8 flex gap-3">
        <Button className="flex-1" onClick={handleNext}>
          המשך
        </Button>
        <Button variant="secondary" className="bg-[#F4F7F7]" onClick={onBack}>
          חזור
        </Button>
      </div>
    </div>
  );
}
