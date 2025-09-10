import { useState } from "react";
import {
  Trash2,
  LoaderCircle,
  Crown,
  Mail,
  LoaderCircleIcon,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { useShareChat } from "../hooks";
import { useChatsProvider } from "../providers/chats-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const MemberChatCard = ({ member, aiConversationId, creatorId, isCreator }) => {
  const { refetchChats } = useChatsProvider();
  const isOwner = member._id === creatorId;

  const [open, setOpen] = useState(false);
  const { isPending, mutate } = useShareChat({
    fn: () => {
      refetchChats();
      setOpen(false);
    },
  });

  const handleRemove = () => {
    mutate({
      data: { aiConversationId, memberId: member._id, isRemove: true },
    });
  };

  return (
    <div className="group min-w-[250px] sm:w-full relative border border-muted-foreground/40 rounded-2xl p-6 hover:-translate-y-0.5">
      <div className="flex items-start gap-4">
        <div className="relative hidden sm:block">
          <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
            <AvatarImage
              src={member?.avatar?.url}
              alt={`${member.fullName}'s avatar`}
              className="object-cover"
            />
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold text-sm">
              {member.fullName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {isOwner && (
            <div className="absolute bg-orange-100 -top-1 -right-1 bg-owner-badge rounded-full p-1.5 shadow-sm">
              <Crown className="h-3 w-3 text-orange-500 rotate-20" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="sm:font-semibold text-foreground truncate sm:text-lg">
              {member.fullName}
            </h3>
            {isOwner && (
              <Badge
                variant="secondary"
                className="bg-orange-50 text-orange-500 border-orange-500 font-medium px-2 py-0.5 text-xs"
              >
                Owner
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
            <Mail className="h-3.5 w-3.5 shrink-0" />
            <span className="text-xs sm:text-sm truncate">{member.email}</span>
          </div>

          {member.role && (
            <Badge variant="outline" className="text-xs font-normal">
              {member.role}
            </Badge>
          )}
        </div>

        {/* Actions */}
        {isCreator && !isOwner && (
          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 w-8 p-0 text-muted-foreground hover:text-destructive",
                  "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                  isPending && "opacity-100"
                )}
              >
                {isPending ? (
                  <LoaderCircleIcon className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="sm:max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-destructive" />
                  Remove Member
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm">
                  Are you sure you want to remove{" "}
                  <strong>{member.fullName}</strong> from the chat? This action
                  cannot be undone and they will lose access immediately.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setOpen(false)}>
                  Cancel
                </AlertDialogCancel>
                <Button
                  variant="destructive"
                  onClick={() => handleRemove(member._id)}
                  disabled={isPending}
                  className="flex items-center gap-2"
                >
                  {isPending && (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  )}
                  Remove Member
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
};

export default MemberChatCard;
