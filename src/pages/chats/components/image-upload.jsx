import { useState, useRef } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UploadIcon, XIcon, ImageIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { useChatProvider } from "../providers/chat-provider";
import { toast } from "sonner";

export default function ImageUpload({ open, onOpenChange, onUpload }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
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

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (files.length > 0) {
      const getTopFiveFiles = files.slice(0, 5 - (chatFiles.length || 0));
      setSelectedFiles(getTopFiveFiles);
      if (files.length > 5 - (chatFiles.length || 0)) {
        toast.error("You can upload up to 5 files.");
        return;
      }
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []).filter((file) =>
      file.type.startsWith("image/")
    );

    if (files.length > 0) {
      const getTopFiveFiles = files.slice(0, 5 - (chatFiles.length || 0));
      setSelectedFiles(getTopFiveFiles);
      if (files.length > 5 - (chatFiles.length || 0)) {
        toast.error("You can upload up to 5 files.");
        return;
      }
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    onUpload(selectedFiles);
    setSelectedFiles([]);
    setUploading(false);
    onOpenChange(false);
  };

  const removeFile = (index) => {
    setSelectedFiles((files) => files.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Upload Images
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              dragActive
                ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <UploadIcon className="h-10 w-10 mx-auto mb-4 text-gray-400" />

            <h3 className="text-lg font-medium mb-2">
              Drag and drop your images here
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Support for PNG, JPG, JPEG, GIF, and WebP files
            </p>
            <p className="text-sm text-gray-500 mb-4">
              You can upload up to 5 images.
            </p>

            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              Browse Images
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">
                Selected Images ({selectedFiles.length})
              </h4>
              <div className="max-h-32 overflow-y-auto space-y-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-md"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <ImageIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
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
                      className="h-6 w-6 flex-shrink-0"
                      onClick={() => removeFile(index)}
                    >
                      <XIcon className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || uploading}
            >
              {uploading
                ? "Uploading..."
                : `Upload ${selectedFiles.length} Image${
                    selectedFiles.length !== 1 ? "s" : ""
                  }`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
