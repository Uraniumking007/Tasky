"use client";

import React, { useState, useEffect, useRef } from "react";
import { api } from "@/trpc/react";
import { useSocket } from "@/hooks/useSocket";
import type { SocketMessage } from "@/lib/socket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  MessageCircle, 
  Send, 
  Users, 
  Wifi, 
  WifiOff,
  MoreHorizontal,
  Edit,
  Trash,
  User
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
function UserAvatar({ user, size = "sm" }: { 
  user: { name?: string | null; username?: string | null; email?: string | null };
  size?: "xs" | "sm" | "md";
}) {
  const sizeClasses = {
    xs: "h-6 w-6 text-xs",
    sm: "h-8 w-8 text-sm", 
    md: "h-10 w-10 text-base"
  };

  const getInitials = () => {
    const name = user.name || user.username || user.email || "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getColorFromString = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      "bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500", 
      "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-teal-500"
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  const name = user.name || user.username || user.email || "Unknown";
  const bgColor = getColorFromString(name);

  return (
    <div className={`${sizeClasses[size]} ${bgColor} rounded-full flex items-center justify-center text-white font-medium shadow-sm`}>
      {getInitials()}
    </div>
  );
}

export function ChatWindow({ teamId, teamName, currentUserId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Get team messages from TRPC
  const { data: messagesData, isLoading: messagesLoading } = api.chat.getTeamMessages.useQuery({
    teamId,
    limit: 50,
  });

  // Get team members
  const { data: teamMembers = [] } = api.chat.getTeamMembers.useQuery({
    teamId,
  });

  // Socket.IO connection with event handlers
  const { isConnected, sendMessage, editMessage, deleteMessage, handleTyping, typingUsers } = useSocket({
    teamId,
    userId: currentUserId,
    onMessage: (message: SocketMessage) => {
      const newMsg: Message = {
        id: message.id,
        content: message.content,
        createdAt: message.createdAt,
        authorId: message.authorId,
        isEdited: message.isEdited,
        editedAt: message.editedAt,
        author: message.author,
      };
      setMessages(prev => [...prev, newMsg]);
    },
    onMessageUpdated: (message: SocketMessage) => {
      const updatedMsg: Message = {
        id: message.id,
        content: message.content,
        createdAt: message.createdAt,
        authorId: message.authorId,
        isEdited: message.isEdited,
        editedAt: message.editedAt,
        author: message.author,
      };
      setMessages(prev => prev.map(msg => 
        msg.id === message.id ? updatedMsg : msg
      ));
    },
    onMessageDeleted: (messageId: string) => {
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    },
    onUserJoined: (user, teamId) => {
      setOnlineUsers(prev => new Set(prev).add(user.id));
      toast({
        title: "User joined",
        description: `${user.name || user.username} joined the chat`,
      });
    },
    onUserLeft: (user, teamId) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(user.id);
        return newSet;
      });
    },
  });

  // Load initial messages
  useEffect(() => {
    if (messagesData?.messages) {
      setMessages(messagesData.messages as Message[]);
    }
  }, [messagesData]);

  // Add current user to online users when connected
  useEffect(() => {
    if (isConnected && currentUserId) {
      setOnlineUsers(prev => new Set(prev).add(currentUserId));
    }
  }, [isConnected, currentUserId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !isConnected) return;

    sendMessage(newMessage.trim(), teamId);
    setNewMessage("");
  };

  const handleEditMessage = (messageId: string, content: string) => {
    if (!content.trim()) return;
    editMessage(messageId, content.trim());
    setEditingMessageId(null);
    setEditContent("");
  };

  const handleDeleteMessage = (messageId: string) => {
    deleteMessage(messageId);
  };

  const startEditing = (messageId: string, currentContent: string) => {
    setEditingMessageId(messageId);
    setEditContent(currentContent);
  };

  const getDisplayName = (user: Message['author']) => {
    return user.name || user.username || user.email || "Unknown User";
  };

  const getTypingText = () => {
    const typingUsersList = Array.from(typingUsers);
    if (typingUsersList.length === 0) return "";
    
    const typingNames = typingUsersList
      .map(userId => {
        const member = teamMembers.find((m: any) => m.id === userId);
        return member?.name || member?.username || "Someone";
      })
      .filter(Boolean);

    if (typingNames.length === 1) {
      return `${typingNames[0]} is typing...`;
    } else if (typingNames.length === 2) {
      return `${typingNames[0]} and ${typingNames[1]} are typing...`;
    } else if (typingNames.length > 2) {
      return `${typingNames[0]} and ${typingNames.length - 1} others are typing...`;
    }
    
    return "";
  };

  const groupedMessages = messages.reduce((acc, message, index) => {
    const prevMessage = messages[index - 1];
    const isSameAuthor = prevMessage?.authorId === message.authorId;
    const isWithinTimeLimit = prevMessage && 
      new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime() < 300000; // 5 minutes

    const shouldGroup = isSameAuthor && isWithinTimeLimit;

    if (shouldGroup && acc.length > 0) {
      acc[acc.length - 1]!.messages.push(message);
    } else {
      acc.push({
        author: message.author,
        authorId: message.authorId,
        messages: [message],
        timestamp: message.createdAt
      });
    }

    return acc;
  }, [] as Array<{
    author: Message['author'];
    authorId: string;
    messages: Message[];
    timestamp: Date;
  }>);

  if (messagesLoading || !currentUserId) {
    return (
      <Card className="h-[700px] flex items-center justify-center border-0 shadow-lg">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <MessageCircle className="h-5 w-5 text-primary animate-pulse" />
          </div>
          <p className="text-sm text-muted-foreground">Loading chat...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-[700px] flex flex-col border-0 shadow-lg bg-gradient-to-b from-background to-muted/10">
      <CardHeader className="p-4 border-b bg-card/90 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold leading-none">{teamName}</h3>
              <p className="text-sm text-muted-foreground">Team Chat</p>
            </div>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? "default" : "destructive"} className="h-6 px-2 text-xs">
              {isConnected ? (
                <><Wifi className="h-3 w-3 mr-1" />Online</>
              ) : (
                <><WifiOff className="h-3 w-3 mr-1" />Offline</>
              )}
            </Badge>
            <Badge variant="outline" className="h-6 px-2 text-xs">
              <Users className="h-3 w-3 mr-1" />
              {onlineUsers.size}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 bg-muted/5">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {groupedMessages.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="h-12 w-12 mx-auto bg-muted/50 rounded-full flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-medium">No messages yet</h3>
                <p className="text-sm text-muted-foreground">Start the conversation with your team!</p>
              </div>
            </div>
          ) : (
            groupedMessages.map((group, groupIndex) => (
              <div key={`group-${groupIndex}`} className="space-y-2">
                <div className={`flex items-start gap-3 ${
                  group.authorId === currentUserId ? 'flex-row-reverse' : 'flex-row'
                }`}>
                  {group.authorId !== currentUserId && (
                    <UserAvatar user={group.author} size="sm" />
                  )}
                  
                  <div className={`flex flex-col space-y-1 max-w-[75%] ${
                    group.authorId === currentUserId ? 'items-end' : 'items-start'
                  }`}>
                    {group.authorId !== currentUserId && (
                      <div className="flex items-center gap-2 px-1">
                        <span className="text-sm font-medium text-foreground">
                          {getDisplayName(group.author)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(group.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                    )}
                    
                    {group.messages.map((message, messageIndex) => (
                      <div 
                        key={message.id} 
                        className={`group relative ${
                          group.authorId === currentUserId ? 'flex flex-row-reverse items-start gap-2' : 'flex items-start gap-2'
                        }`}
                      >
                        <div className={`rounded-lg px-3 py-2 shadow-sm max-w-full ${
                          group.authorId === currentUserId
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-card border'
                        }`}>
                          {editingMessageId === message.id ? (
                            <div className="space-y-2 min-w-[200px]">
                              <Input
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="border-0 bg-transparent p-0 focus-visible:ring-0 text-sm"
                                autoFocus
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleEditMessage(message.id, editContent)}
                                  className="h-6 px-2 text-xs"
                                >
                                  Save
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
                              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                {message.content}
                              </p>
                              <div className="flex items-center gap-2 text-xs opacity-60">
                                {message.isEdited && (
                                  <span>Edited </span>
                                )}
                                {group.authorId === currentUserId && messageIndex === group.messages.length - 1 && (
                                  <span className="ml-auto">
                                    {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Message actions (only for own messages) */}
                        {message.authorId === currentUserId && editingMessageId !== message.id && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 hover:bg-muted"
                              >
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-32">
                              <DropdownMenuItem onClick={() => startEditing(message.id, message.content)}>
                                <Edit className="h-3 w-3 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteMessage(message.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash className="h-3 w-3 mr-2" />
                                Delete
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

        {/* Typing indicator */}
        {getTypingText() && (
          <div className="px-4 py-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="italic text-xs">{getTypingText()}</span>
            </div>
          </div>
        )}

        {/* Message input */}
        <div className="p-4 bg-card/50 backdrop-blur-sm border-t">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping(teamId);
                }}
                placeholder={isConnected ? "Type your message..." : "Connecting..."}
                disabled={!isConnected}
                className="pr-12 h-10 rounded-lg border-muted/50 bg-background/90 focus:bg-background transition-colors text-sm"
                maxLength={1000}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                {newMessage.length}/1000
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={!newMessage.trim() || !isConnected}
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