import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  SocketMessage,
  SocketUser,
} from "@/lib/socket";

type SocketInstance = Socket<ServerToClientEvents, ClientToServerEvents>;

interface UseSocketOptions {
  teamId?: string;
  userId?: string;
  onMessage?: (message: SocketMessage) => void;
  onUserJoined?: (user: SocketUser, teamId: string) => void;
  onUserLeft?: (user: SocketUser, teamId: string) => void;
  onTypingStart?: (user: SocketUser, teamId: string) => void;
  onTypingStop?: (user: SocketUser, teamId: string) => void;
  onMessageUpdated?: (message: SocketMessage) => void;
  onMessageDeleted?: (messageId: string) => void;
}

export function useSocket(options: UseSocketOptions = {}) {
  const [socket, setSocket] = useState<SocketInstance | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const socketRef = useRef<SocketInstance | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use refs to store callbacks to prevent unnecessary reconnections
  const callbacksRef = useRef(options);
  callbacksRef.current = options;

  useEffect(() => {
    // Try to determine the correct server URL
    let serverUrl;
    if (process.env.NODE_ENV === "production") {
      serverUrl = process.env.NEXTAUTH_URL || "";
    } else {
      // In development, use the current window origin or fallback
      serverUrl = typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_SERVER_URL;
    }
    
    const socketInstance: SocketInstance = io(serverUrl, {
      path: "/api/socket",
      autoConnect: true,
      transports: ['polling', 'websocket'], // Start with polling, then upgrade
      timeout: 20000,
      forceNew: true,
      upgrade: true,
      rememberUpgrade: true,
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Socket.IO connection error:", error);
    });

    socketInstance.on("disconnect", (reason) => {
      setIsConnected(false);
    });

    // Set up event listeners using refs
    socketInstance.on("message:new", (message) => {
      callbacksRef.current.onMessage?.(message);
    });

    socketInstance.on("message:updated", (message) => {
      callbacksRef.current.onMessageUpdated?.(message);
    });

    socketInstance.on("message:deleted", (messageId) => {
      callbacksRef.current.onMessageDeleted?.(messageId);
    });

    socketInstance.on("user:joined", (user, teamId) => {
      callbacksRef.current.onUserJoined?.(user, teamId);
    });

    socketInstance.on("user:left", (user, teamId) => {
      callbacksRef.current.onUserLeft?.(user, teamId);
    });

    socketInstance.on("typing:start", (user, teamId) => {
      setTypingUsers((prev) => new Set(prev).add(user.id));
      callbacksRef.current.onTypingStart?.(user, teamId);
    });

    socketInstance.on("typing:stop", (user, teamId) => {
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(user.id);
        return newSet;
      });
      callbacksRef.current.onTypingStop?.(user, teamId);
    });

    socketInstance.on("error", (error) => {
      console.error("Socket.IO error:", error);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []); // Empty dependency array - socket connection only created once

  // Join team when teamId changes
  useEffect(() => {
    if (socket && options.teamId && options.userId && isConnected) {
      const currentTeamId = options.teamId;
      const currentUserId = options.userId;
      socket.emit("team:join", { teamId: currentTeamId, userId: currentUserId });
      
      return () => {
        socket.emit("team:leave", currentTeamId);
      };
    }
  }, [socket, options.teamId, options.userId, isConnected]);

  const sendMessage = (content: string, teamId: string) => {
    if (socket && isConnected && options.userId) {
      socket.emit("message:send", { content, teamId, userId: options.userId });
    }
  };

  const editMessage = (messageId: string, content: string) => {
    if (socket && isConnected && options.userId) {
      socket.emit("message:edit", { messageId, content, userId: options.userId });
    }
  };

  const deleteMessage = (messageId: string) => {
    if (socket && isConnected && options.userId) {
      socket.emit("message:delete", { messageId, userId: options.userId });
    }
  };

  const startTyping = (teamId: string) => {
    if (socket && isConnected && options.userId) {
      socket.emit("typing:start", { teamId, userId: options.userId });
    }
  };

  const stopTyping = (teamId: string) => {
    if (socket && isConnected && options.userId) {
      socket.emit("typing:stop", { teamId, userId: options.userId });
    }
  };

  const handleTyping = (teamId: string) => {
    if (!socket || !isConnected) return;

    startTyping(teamId);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(teamId);
    }, 3000);
  };

  return {
    socket,
    isConnected,
    typingUsers,
    sendMessage,
    editMessage,
    deleteMessage,
    startTyping,
    stopTyping,
    handleTyping,
  };
}
