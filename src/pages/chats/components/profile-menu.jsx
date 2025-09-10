import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  UserIcon,
  HistoryIcon,
  MoreHorizontalIcon,
  MessageSquareIcon,
  ClockIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { useAuth, useLogout } from "@/hooks";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

import { useGetStats } from "../hooks";
import { useChatsProvider } from "../providers/chats-provider";

import { Loader } from "@/components";

export default function ProfileMenu() {
  const { user } = useAuth();
  const { logout } = useLogout();
  const navigate = useNavigate();

  const { chats } = useChatsProvider();
  const { isLoading, data } = useGetStats();
  const [profileOpen, setProfileOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  if (isLoading) return <Loader />;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 p-2">
            <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
              {user?.avatar?.url ? (
                <img
                  src={user?.avatar?.url}
                  alt={user?.fullName}
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <UserIcon className="h-4 w-4" />
              )}
            </div>
            <span className="text-sm font-medium">{user?.fullName}</span>
            <MoreHorizontalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => setProfileOpen(true)}>
            <UserIcon className="h-4 w-4 mr-2" />
            Profile Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setHistoryOpen(true)}>
            <HistoryIcon className="h-4 w-4 mr-2" />
            Chat History
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          {user?.role === "Admin" ? (
            <DropdownMenuItem onClick={() => navigate("/dashboard/profile")}>
              <ShieldCheckIcon className="h-4 w-4 mr-2" />
              Admin Dashboard
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              <UserIcon className="h-4 w-4 mr-2" />
              Profile
            </DropdownMenuItem>
          )}

          <DropdownMenuItem className="text-red-600" onClick={() => logout()}>
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Profile Settings
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                {user?.avatar?.url ? (
                  <img
                    src={user?.avatar?.url}
                    alt={user?.fullName}
                    className="h-16 w-16 rounded-full"
                  />
                ) : (
                  <UserIcon className="h-8 w-8" />
                )}
              </div>
              <div>
                <h3 className="font-semibold">{user.fullName}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HistoryIcon className="h-5 w-5" />
              Your Chat History
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="recent" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="recent">Recent Chats</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>

            <TabsContent value="recent" className="space-y-4">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {chats.slice(0, 10).map((chat) => (
                    <Card
                      key={chat._id}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            <MessageSquareIcon className="h-4 w-4" />

                            {chat.name}
                          </CardTitle>
                          <Badge variant="outline" className="text-xs">
                            {chat?.model}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <ClockIcon className="h-3 w-3" />

                            {formatDistanceToNow(chat.createdAt, {
                              addSuffix: true,
                            })}
                          </span>
                          <span>{chat?.messageCount} messages</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="stats" className="space-y-4">
              <h1 className="font-medium">Last 30 days statistics</h1>
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Total Chats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {data?.last30DaysChatsCount}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Total Messages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {data?.messageCount}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Most Used Models</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[160px] overflow-y-auto">
                    {(data?.conversationCount || []).map((item) => (
                      <div
                        key={item.model}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm">{item.model}</span>
                        <Badge variant="secondary">
                          {item.conversationCount} chats
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end">
            <Button onClick={() => setHistoryOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
