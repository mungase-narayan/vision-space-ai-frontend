import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import { cn } from "@/lib/utils";
import { Loader2, Trash2 } from "lucide-react";

const ConfirmDeleteButton = ({
  onDelete,
  itemName = "item",
  text = "",
  isLoading = false,
  className = "",
}) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
          className={cn(
            "hover:text-red-500 p-1 gap-2 flex items-center justify-center transition-all cursor-pointer",
            className
          )}
        >
          <Trash2 size={15} />
          <span className="text-sm"> {text}</span>
        </div>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the{" "}
            <b>{itemName}</b>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-white hover:bg-destructive/90"
            onClick={onDelete}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="animate-spin" />}Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDeleteButton;
