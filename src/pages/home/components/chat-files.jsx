import { useState } from "react";
import { FileText, X } from "lucide-react";

import Hint from "@/components/ui/hint";
import { EXT_COLOR } from "@/constants";
import { cn, getFileExtensionCategory } from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useChatContext } from "../provider";

const unsupportedTypes = [
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

function ChatFiles({ id, file, base64, type, showRemove }) {
  const { setFiles, tab, tabId, updateTabs } = useChatContext();
  const [open, setOpen] = useState(false);

  const hanldeRemoveFile = () => {
    setFiles((prev) => {
      const files = [...prev];
      const result = files.filter((f) => f.id !== id);
      updateTabs({ files: result }, tabId);
      return result;
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {type === "image" ? (
        <div
          onClick={() => {
            if (!tab.isConversation) setOpen(true);
          }}
          className={cn(
            "p-1 min-w-[50px] flex items-center justify-center max-w-[50px] rounded-lg bg-muted-foreground/20 h-[50px] relative cursor-pointer",
            tab.isConversation && "cursor-not-allowed"
          )}
        >
          {showRemove && (
            <button
              className="absolute top-1 right-1 bg-muted p-0.5 rounded-full cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                hanldeRemoveFile();
              }}
            >
              <X size={15} />
            </button>
          )}
          <img alt="preview" className="size-[40px] rounded-md" src={base64} />
        </div>
      ) : (
        <div
          onClick={() => {
            if (!tab.isConversation) setOpen(true);
          }}
          className={cn(
            "relative w-[250px] h-[50px] px-2 rounded-lg bg-muted-foreground/20 flex items-center gap-1 cursor-pointer",
            tab.isConversation && "cursor-not-allowed"
          )}
        >
          {showRemove && (
            <button
              className="absolute top-1 right-1 bg-muted p-0.5 rounded-full cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                hanldeRemoveFile();
              }}
            >
              <X size={15} />
            </button>
          )}
          <p
            className={cn(
              "shrink-0 rounded-lg p-2",
              EXT_COLOR[getFileExtensionCategory(file)] ||
                "bg-muted-foreground/40"
            )}
          >
            <FileText size={20} />
          </p>

          <div>
            <Hint label={file.name}>
              <h1 className="truncate w-[190px] text-xs">{file.name}</h1>
            </Hint>
            <p className="font-medium text-sm">
              {getFileExtensionCategory(file)}
            </p>
          </div>
        </div>
      )}

      <DialogContent className="sm:max-w-[425px] md:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Preview</DialogTitle>
          <DialogDescription>
            <></>
          </DialogDescription>
        </DialogHeader>
        <div className="h-[400px] sm:h-[600px] sm:w-full flex items-center justify-center pt-1">
          {type == "file" && !unsupportedTypes.includes(file.type) ? (
            <iframe
              src={URL.createObjectURL(file)}
              title="Preview"
              className="w-full rounded-sm shadow-lg h-full"
              allowFullScreen
            />
          ) : type === "image" ? (
            <img src={base64} alt="image" className="h-[450px] aspect-auto" />
          ) : (
            <div className="text-center">
              <p className="mb-2">Preview not supported for this file type.</p>
              <a
                href={URL.createObjectURL(file)}
                download={file.name}
                className="underline text-blue-600"
              >
                Download File
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ChatFiles;
