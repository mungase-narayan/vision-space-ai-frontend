import { useState } from "react";
import { FileIcon, Loader2, UploadIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { useChatProvider } from "../providers/chat-provider";

export default function DocumentUpload({ onUpload, fileLoading }) {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const { files: chatFiles } = useChatProvider();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      const getTopFiveFiles = newFiles.slice(0, 5 - (chatFiles.length || 0));
      setFiles((prev) => [...prev, ...getTopFiveFiles]);

      if (newFiles.length > 5 - (chatFiles.length || 0)) {
        toast.error("You can upload up to 5 files.");
        return;
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const getTopFiveFiles = newFiles.slice(0, 5 - (chatFiles.length || 0));
      setFiles((prev) => [...prev, ...getTopFiveFiles]);

      if (newFiles.length > 5 - (chatFiles.length || 0)) {
        toast.error("You can upload up to 5 files.");
        return;
      }
    }
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (files.length === 0) return;
    onUpload(files);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          dragActive
            ? "border-primary bg-primary/5"
            : "border-gray-300 dark:border-gray-700"
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <UploadIcon className="mx-auto h-10 w-10 text-gray-400 dark:text-gray-600 mb-4" />

        <p className="text-sm font-medium mb-1">
          Drag and drop your files here
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Support for PDF, DOCX, TXT, CSV, XLSX, and more
        </p>

        <Input
          id="file-upload"
          type="file"
          accept="application/*,text/*,.ts,.tsx,.js,.jsx,.mjs,.cjs,.html,.htm,.css,.scss,.sass,.py,.java,.c,.cpp,.cs,.go,.rb,.php,.rs,.swift,.kt,.kts,.sql,.json,.xml,.sh,.bat,.ps1,.yaml,.yml,.ini,.toml,.md,.txt,.env,.Dockerfile,.make,.mk,.pl,.lua,.r,.jl,.hs,.scala,.vb,.vbs,.asm"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />

        <Button
          variant="outline"
          onClick={() => document.getElementById("file-upload")?.click()}
          className="text-sm"
        >
          Browse Files
        </Button>
      </div>

      {files.length > 0 && (
        <div className="mt-4">
          <div className="text-sm font-medium mb-2">
            Selected Files ({files.length})
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 p-2 rounded-md"
              >
                <div className="flex items-center gap-2">
                  <FileIcon className="h-4 w-4 text-gray-500" />

                  <div>
                    <p className="text-sm font-medium truncate max-w-[200px]">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => removeFile(index)}
                >
                  <XIcon className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>

          <Button className="mt-4 w-full" onClick={handleUpload}>
            {fileLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Upload {files.length} {files.length === 1 ? "File" : "Files"}
          </Button>
        </div>
      )}
    </div>
  );
}
