"use client";

import React, { useState, useEffect, useRef } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  Send,
  Users,
  MoreHorizontal,
  Edit,
  Trash,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatWindowProps {
  teamId: string;
  teamName: string;
  currentUserId: string;
}

interface Message {
  id: string;
  content: string;
  createdAt: Date;
  authorId: string;
  isEdited: boolean;
  editedAt?: Date | null;
  author: {
    id: string;
    name?: string | null;
    username?: string | null;
    email?: string | null;
  };
}

// Avatar component for users
function UserAvatar({
  user,
  size = "sm",
}: {
  user: {
    name?: string | null;
    username?: string | null;
    email?: string | null;
  };
  size?: "xs" | "sm" | "md";
}) {
  const sizeClasses = {
    xs: "h-6 w-6 text-xs",
    sm: "h-8 w-8 text-sm",
    md: "h-10 w-10 text-base",
  };

  const getInitials = () => {
    const name = user.name || user.username || user.email || "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getColorFromString = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  const name = user.name || user.username || user.email || "Unknown";
  const bgColor = getColorFromString(name);

  return (
    <div
      className={`${sizeClasses[size]} ${bgColor} flex items-center justify-center rounded-full font-medium text-white shadow-sm`}
    >
      {getInitials()}
    </div>
  );
}

export function ChatWindow({
  teamId,
  teamName,
  currentUserId,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Get team messages from TRPC with polling for real-time updates
  const { data: messagesData, isLoading: messagesLoading } =
    api.chat.getTeamMessages.useQuery(
      {
        teamId,
        limit: 50,
      },
      {
        refetchInterval: 3000, // Poll every 3 seconds for new messages
        refetchIntervalInBackground: true,
      }
    );

  // Get team members
  const { data: teamMembers = [] } = api.chat.getTeamMembers.useQuery({
    teamId,
  });

  // TRPC mutations
  const sendMessageMutation = api.chat.sendMessage.useMutation({
    onSuccess: (data) => {
      // Add the new message to the local state
      setMessages((prev) => [...prev, data.message as Message]);
      setNewMessage("");
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send message",
      });
    },
  });

  const editMessageMutation = api.chat.editMessage.useMutation({
    onSuccess: (data) => {
      // Update the message in local state
      setMessages((prev) =>
        prev.map((msg) => (msg.id === data.message.id ? data.message as Message : msg))
      );
      setEditingMessageId(null);
      setEditContent("");
      toast({
        title: "Message updated",
        description: "Your message has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update message",
      });
    },
  });

  const deleteMessageMutation = api.chat.deleteMessage.useMutation({
    onSuccess: (data) => {
      // Remove the message from local state
      setMessages((prev) => prev.filter((msg) => msg.id !== data.messageId));
      toast({
        title: "Message deleted",
        description: "Your message has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete message",
      });
    },
  });

  // Load initial messages
  useEffect(() => {
    if (messagesData?.messages) {
      setMessages(messagesData.messages as Message[]);
    }
  }, [messagesData]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    sendMessageMutation.mutate({
      content: newMessage.trim(),
      teamId,
    });
  };

  const handleEditMessage = (messageId: string, content: string) => {
    if (!content.trim()) return;
    editMessageMutation.mutate({
      messageId,
      content: content.trim(),
    });
  };

  const handleDeleteMessage = (messageId: string) => {
    deleteMessageMutation.mutate({
      messageId,
    });
  };

  const startEditing = (messageId: string, currentContent: string) => {
    setEditingMessageId(messageId);
    setEditContent(currentContent);
  };

  const getDisplayName = (user: Message["author"]) => {
    return user.name || user.username || user.email || "Unknown User";
  };

  // const getTypingText = () => {
  //   const typingUsersList = Array.from(typingUsers);
  //   if (typingUsersList.length === 0) return "";

  //   const typingNames = typingUsersList
  //     .map((userId) => {
  //       const member = teamMembers.find(
  //         (m: {
  //           id: string;
  //           name: string | null;
  //           username: string | null;
  //           email: string | null;
  //           role: string;
  //           accessType: string;
  //         }) => m.id === userId,
  //       );
  //       return member?.name || member?.username || "Someone";
  //     })
  //     .filter(Boolean);

  //   if (typingNames.length === 1) {
  //     return `${typingNames[0]} is typing...`;
  //   } else if (typingNames.length === 2) {
  //     return `${typingNames[0]} and ${typingNames[1]} are typing...`;
  //   } else if (typingNames.length > 2) {
  //     return `${typingNames[0]} and ${typingNames.length - 1} others are typing...`;
  //   }

  //   return "";
  // };

  const groupedMessages = messages.reduce(
    (acc, message, index) => {
      const prevMessage = messages[index - 1];
      const isSameAuthor = prevMessage?.authorId === message.authorId;
      const isWithinTimeLimit =
        prevMessage &&
        new Date(message.createdAt).getTime() -
          new Date(prevMessage.createdAt).getTime() <
          300000; // 5 minutes

      const shouldGroup = isSameAuthor && isWithinTimeLimit;

      if (shouldGroup && acc.length > 0) {
        acc[acc.length - 1]!.messages.push(message);
      } else {
        acc.push({
          author: message.author,
          authorId: message.authorId,
          messages: [message],
          timestamp: message.createdAt,
        });
      }

      return acc;
    },
    [] as Array<{
      author: Message["author"];
      authorId: string;
      messages: Message[];
      timestamp: Date;
    }>,
  );

  if (messagesLoading || !currentUserId) {
    return (
      <Card className="flex h-[700px] items-center justify-center border-0 shadow-lg">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <MessageCircle className="h-5 w-5 animate-pulse text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">Loading chat...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex h-[700px] flex-col border-0 bg-gradient-to-b from-background to-muted/10 shadow-lg">
      <CardHeader className="border-b bg-card/90 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <MessageCircle className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold leading-none">{teamName}</h3>
              <p className="text-sm text-muted-foreground">Team Chat</p>
            </div>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="h-6 px-2 text-xs">
              <Users className="mr-1 h-3 w-3" />
              {teamMembers.length}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col bg-muted/5 p-0">
        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {groupedMessages.length === 0 ? (
            <div className="space-y-4 py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
                <MessageCircle className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-medium">No messages yet</h3>
                <p className="text-sm text-muted-foreground">
                  Start the conversation with your team!
                </p>
              </div>
            </div>
          ) : (
            groupedMessages.map((group, groupIndex) => (
              <div key={`group-${groupIndex}`} className="space-y-2">
                <div
                  className={`flex items-start gap-3 ${
                    group.authorId === currentUserId
                      ? "flex-row-reverse"
                      : "flex-row"
                  }`}
                >
                  {group.authorId !== currentUserId && (
                    <UserAvatar user={group.author} size="sm" />
                  )}

                  <div
                    className={`flex max-w-[75%] flex-col space-y-1 ${
                      group.authorId === currentUserId
                        ? "items-end"
                        : "items-start"
                    }`}
                  >
                    {group.authorId !== currentUserId && (
                      <div className="flex items-center gap-2 px-1">
                        <span className="text-sm font-medium text-foreground">
                          {getDisplayName(group.author)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(group.timestamp), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    )}

                    {group.messages.map((message, messageIndex) => (
                      <div
                        key={message.id}
                        className={`group relative ${
                          group.authorId === currentUserId
                            ? "flex flex-row-reverse items-start gap-2"
                            : "flex items-start gap-2"
                        }`}
                      >
                        <div
                          className={`max-w-full rounded-lg px-3 py-2 shadow-sm ${
                            group.authorId === currentUserId
                              ? "bg-primary text-primary-foreground"
                              : "border bg-card"
                          }`}
                        >
                          {editingMessageId === message.id ? (
                            <div className="min-w-[200px] space-y-2">
                              <Input
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="border-0 bg-transparent p-0 text-sm focus-visible:ring-0"
                                autoFocus
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleEditMessage(message.id, editContent)
                                  }
                                  className="h-6 px-2 text-xs"
                                  disabled={editMessageMutation.isPending}
                                >
                                  {editMessageMutation.isPending ? "Saving..." : "Save"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingMessageId(null);
                                    setEditContent("");
                                  }}
                                  className="h-6 px-2 text-foreground"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                                {message.content}
                              </p>
                              <div className="flex items-center gap-2 text-xs opacity-60">
                                {message.isEdited && <span>Edited </span>}
                                {group.authorId === currentUserId &&
                                  messageIndex ===
                                    group.messages.length - 1 && (
                                    <span className="ml-auto">
                                      {formatDistanceToNow(
                                        new Date(message.createdAt),
                                        { addSuffix: true },
                                      )}
                                    </span>
                                  )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Message actions (only for own messages) */}
                        {message.authorId === currentUserId &&
                          editingMessageId !== message.id && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 opacity-0 hover:bg-muted group-hover:opacity-100"
                                >
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-32">
                                <DropdownMenuItem
                                  onClick={() =>
                                    startEditing(message.id, message.content)
                                  }
                                >
                                  <Edit className="mr-2 h-3 w-3" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleDeleteMessage(message.id)
                                  }
                                  className="text-destructive focus:text-destructive"
                                  disabled={deleteMessageMutation.isPending}
                                >
                                  <Trash className="mr-2 h-3 w-3" />
                                  {deleteMessageMutation.isPending ? "Deleting..." : "Delete"}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message input */}
        <div className="border-t bg-card/50 p-4 backdrop-blur-sm">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <div className="relative flex-1">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={sendMessageMutation.isPending}
                className="h-10 rounded-lg border-muted/50 bg-background/90 pr-12 text-sm transition-colors focus:bg-background"
                maxLength={1000}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                {newMessage.length}/1000
              </div>
            </div>
            <Button
              type="submit"
              disabled={!newMessage.trim() || sendMessageMutation.isPending}
              size="icon"
              className="h-10 w-10 rounded-lg"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
} 