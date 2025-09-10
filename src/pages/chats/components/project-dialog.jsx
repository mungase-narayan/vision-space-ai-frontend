import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { toast } from "sonner";
import { v4 as uuid } from "uuid";
import { useEffect, useState } from "react";
import {
  Settings,
  ShapesIcon as AttachmentIcon,
  ImageIcon,
  Loader2,
  Eye,
} from "lucide-react";

import { getBase64, getFileExtensionCategory, readAnyFile } from "@/lib/utils";

import { useUpdateProject, useUploadFile } from "../hooks";
import ImageUpload from "./image-upload";
import DocumentUpload from "./document-upload";
import DisplayProjectFiles from "./display-project-files";
import { useChatsProvider } from "../providers/chats-provider";
import { Input } from "@/components/ui/input";

function ProjectDialog({ project }) {
  const { refetchProjects, updateTab } = useChatsProvider();
  const { uploadFile } = useUploadFile();

  const [files, setFiles] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [projectName, setProjectName] = useState("");
  const [open, setOpen] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);

  const { mutate, isPending } = useUpdateProject({
    fn: () => {
      refetchProjects();
      project?.allChats.map((c) =>
        updateTab({ projectFiles: files, projectPrompt: prompt }, c._id)
      );
      setOpen(false);
    },
  });

  useEffect(() => {
    if (project) {
      setFiles(project.files);
      setPrompt(project.prompt);
      setProjectName(project?.name);
    }
  }, [project]);

  const handleUpload = async (files) => {
    setFileLoading(true);
    setShowUpload(false);
    await Promise.all(
      files.map(async (file) => {
        if (file.size > 10485760) {
          toast.error("The file size must be less than 10 MB");
          return;
        }

        const formData = new FormData();
        formData.append("file", file);
        const res = await uploadFile({ data: formData });
        const url = res?.data?.data?.url;

        let text = await readAnyFile(file);
        const data = {
          file,
          id: uuid(),
          text,
          name: file.name,
          type: "file",
          extension: file.type,
          url,
          category: getFileExtensionCategory(file),
        };
        setFiles((prev) => [...prev, data]);
      })
    ).finally(() => {
      setFileLoading(false);
    });
  };

  const handleImageUpload = async (files) => {
    setFileLoading(true);
    setShowImageUpload(false);
    await Promise.all(
      files.map(async (file) => {
        if (file.size > 5242880) {
          toast.error("The image size must be less than 5 MB");
          return;
        }
        let text = await getBase64(file);
        const data = {
          file,
          id: uuid(),
          text,
          name: file.name,
          type: "image",
          extension: file.type,
          url: "",
          category: getFileExtensionCategory(file),
        };
        setFiles((prev) => [...prev, data]);
      })
    ).finally(() => {
      setFileLoading(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="cursor-pointer p-1 hover:bg-muted transition-all rounded-lg flex items-center px-3 py-1 gap-2"
        >
          {project.isCreator ? <Settings size={13} /> : <Eye size={13} />}
          <span className="text-sm">
            {project.isCreator ? "Manage" : "View"}
          </span>
        </div>
      </DialogTrigger>
      <DialogContent className="min-w-[calc(90vw)]">
        <DialogHeader>
          <DialogTitle>Manage Project Files & Guidelines</DialogTitle>
          <DialogDescription>{project?.name}</DialogDescription>
        </DialogHeader>
        <div className="relative">
          <div className="flex flex-col gap-2 mb-2">
            <h1 className="font-medium text-sm">Project Name</h1>
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              rows={5}
              placeholder="Project Name"
              disabled={!project.isCreator}
            />
          </div>

          <div className="flex flex-col gap-2 mb-2">
            <h1 className="font-medium text-sm">Project Instructions</h1>
            <Textarea
              className="max-h-[250px] overflow-y-auto"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
              placeholder="Add Instructions"
              disabled={!project.isCreator}
            />
          </div>

          {showUpload ? (
            <div className="mb-4">
              <DocumentUpload
                onOpenChange={() => setShowUpload(false)}
                onUpload={handleUpload}
                fileLoading={fileLoading}
              />

              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => setShowUpload(false)}
              >
                Cancel
              </Button>
            </div>
          ) : null}

          <ImageUpload
            open={showImageUpload}
            onOpenChange={setShowImageUpload}
            onUpload={handleImageUpload}
          />

          {fileLoading && (
            <div className="text-xs py-1 flex items-center gap-1">
              <Loader2 size={10} className="animate-spin" />
              <span>Please wait uploading files...</span>
            </div>
          )}

          {!!files.length && (
            <div className="flex flex-wrap gap-3 py-2 hide-scrollbar max-h-[200px] overflow-y-auto">
              {files.map((file) => (
                <DisplayProjectFiles
                  key={file.id}
                  id={file.id}
                  data={file}
                  setFiles={setFiles}
                  showRemove={project.isCreator}
                />
              ))}
            </div>
          )}
          {project.isCreator && (
            <div className="grid grid-cols-2 gap-3">
              <button
                disabled={files.length >= 5}
                className="w-full rounded-lg border p-3 flex flex-col hover:bg-muted shadow-sm cursor-pointer"
                onClick={() => {
                  if (files.length >= 5) {
                    return;
                  }
                  setShowUpload((prev) => !prev);
                }}
              >
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <AttachmentIcon size={15} />
                  <h1 className="hidden sm:block">Add Files</h1>
                </div>
                <span className="hidden md:block md:text-sm text-start">
                  Chats in this project can access this file content
                </span>
              </button>

              <button
                className="w-full rounded-lg border p-3 flex-col flex hover:bg-muted shadow-sm cursor-pointer"
                disabled={files.length >= 5}
                onClick={() => {
                  if (files.length >= 5) {
                    return;
                  }
                  setShowImageUpload(true);
                }}
              >
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <ImageIcon size={15} />
                  <h1 className="hidden sm:block">Add Images</h1>
                </div>
                <span className="hidden md:block md:text-sm text-start text-muted-foreground">
                  Chats in this project can access this image content
                </span>
              </button>
            </div>
          )}
        </div>

        {project.isCreator && (
          <DialogFooter>
            <Button
              onClick={() => {
                if (!projectName) {
                  toast.error("Please enter project name");
                  return;
                }
                mutate({
                  data: {
                    files,
                    projectId: project._id,
                    prompt,
                    name: projectName,
                  },
                });
              }}
            >
              {isPending && <Loader2 className="animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ProjectDialog;
