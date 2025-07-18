import { Server as NetServer } from "http";
import { NextApiRequest, NextApiResponse } from "next";
import { Server as SocketIOServer } from "socket.io";
import { db } from "@/server/db";
import { canUserAccessTeamChat } from "@/lib/permissions";

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};

export interface SocketUser {
  id: string;
  name?: string | null;
  username?: string | null;
  email?: string | null;
}

export interface SocketMessage {
  id: string;
  content: string;
  createdAt: Date;
  authorId: string;
  teamId: string;
  isEdited: boolean;
  editedAt?: Date | null;
  author: SocketUser;
}

export interface ServerToClientEvents {
  "message:new": (message: SocketMessage) => void;
  "message:updated": (message: SocketMessage) => void;
  "message:deleted": (messageId: string) => void;
  "user:joined": (user: SocketUser, teamId: string) => void;
  "user:left": (user: SocketUser, teamId: string) => void;
  "typing:start": (user: SocketUser, teamId: string) => void;
  "typing:stop": (user: SocketUser, teamId: string) => void;
  error: (message: string) => void;
}

export interface ClientToServerEvents {
  "team:join": (data: { teamId: string; userId: string }) => void;
  "team:leave": (teamId: string) => void;
  "message:send": (data: { content: string; teamId: string; userId: string }) => void;
  "message:edit": (data: { messageId: string; content: string; userId: string }) => void;
  "message:delete": (data: { messageId: string; userId: string }) => void;
  "typing:start": (data: { teamId: string; userId: string }) => void;
  "typing:stop": (data: { teamId: string; userId: string }) => void;
}

// Helper function to authenticate user
async function authenticateUser(userId: string): Promise<SocketUser | null> {
  try {
    const user = await db.users.findFirst({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
      },
    });
    return user;
  } catch (error) {
    console.error("Error authenticating user:", error);
    return null;
  }
}

// This function is now replaced by canUserAccessTeamChat from permissions.ts

export const initSocket = (
  req: NextApiRequest,
  res: NextApiResponseServerIO,
) => {
  if (!res.socket.server.io) {
    const io = new SocketIOServer(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
      cors: {
        origin: "*", // Allow all origins in development
        methods: ["GET", "POST"],
        credentials: true,
      },
      allowEIO3: true,
      transports: ['polling', 'websocket'],
    });

    io.on("connection", (socket) => {
      // Handle team joining
      socket.on("team:join", async (data: { teamId: string; userId: string }) => {
        try {
          const user = await authenticateUser(data.userId);
          if (!user) {
            socket.emit("error", "Authentication failed");
            return;
          }

          const accessCheck = await canUserAccessTeamChat(data.userId, data.teamId);
          if (!accessCheck.canAccess) {
            socket.emit("error", "Not authorized to join this team");
            return;
          }

          socket.data.user = user;
          socket.join(`team:${data.teamId}`);
          socket.to(`team:${data.teamId}`).emit("user:joined", user, data.teamId);
        } catch (error) {
          console.error("Error joining team:", error);
          socket.emit("error", "Failed to join team");
        }
      });

      // Handle team leaving
      socket.on("team:leave", (teamId: string) => {
        const user = socket.data.user;
        if (!user) return;

        socket.leave(`team:${teamId}`);
        socket.to(`team:${teamId}`).emit("user:left", user, teamId);
      });

      // Handle sending messages
      socket.on("message:send", async (data: { content: string; teamId: string; userId: string }) => {
        try {
          const user = await authenticateUser(data.userId);
          if (!user) {
            socket.emit("error", "Authentication failed");
            return;
          }

          const accessCheck = await canUserAccessTeamChat(data.userId, data.teamId);
          if (!accessCheck.canAccess) {
            socket.emit("error", "Not authorized to send messages to this team");
            return;
          }

          // Create message in database
          const message = await db.message.create({
            data: {
              content: data.content,
              authorId: data.userId,
              teamId: data.teamId,
            },
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  email: true,
                },
              },
            },
          });

          // Broadcast to all team members
          io.to(`team:${data.teamId}`).emit("message:new", message);
        } catch (error) {
          console.error("Error sending message:", error);
          socket.emit("error", "Failed to send message");
        }
      });

      // Handle typing indicators
      socket.on("typing:start", async (data: { teamId: string; userId: string }) => {
        const user = await authenticateUser(data.userId);
        if (!user) return;

        const accessCheck = await canUserAccessTeamChat(data.userId, data.teamId);
        if (!accessCheck.canAccess) return;

        socket.to(`team:${data.teamId}`).emit("typing:start", user, data.teamId);
      });

      socket.on("typing:stop", async (data: { teamId: string; userId: string }) => {
        const user = await authenticateUser(data.userId);
        if (!user) return;

        const accessCheck = await canUserAccessTeamChat(data.userId, data.teamId);
        if (!accessCheck.canAccess) return;

        socket.to(`team:${data.teamId}`).emit("typing:stop", user, data.teamId);
      });

      // Handle message editing
      socket.on("message:edit", async (data: { messageId: string; content: string; userId: string }) => {
        try {
          const user = await authenticateUser(data.userId);
          if (!user) {
            socket.emit("error", "Authentication failed");
            return;
          }

          const message = await db.message.findFirst({
            where: {
              id: data.messageId,
              authorId: data.userId, // Only author can edit
            },
          });

          if (!message) {
            socket.emit("error", "Message not found or not authorized");
            return;
          }

          const updatedMessage = await db.message.update({
            where: { id: data.messageId },
            data: {
              content: data.content,
              isEdited: true,
              editedAt: new Date(),
            },
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  email: true,
                },
              },
            },
          });

          io.to(`team:${message.teamId}`).emit("message:updated", updatedMessage);
        } catch (error) {
          console.error("Error editing message:", error);
          socket.emit("error", "Failed to edit message");
        }
      });

      // Handle message deletion
      socket.on("message:delete", async (data: { messageId: string; userId: string }) => {
        try {
          const user = await authenticateUser(data.userId);
          if (!user) {
            socket.emit("error", "Authentication failed");
            return;
          }

          const message = await db.message.findFirst({
            where: {
              id: data.messageId,
              authorId: data.userId, // Only author can delete
            },
          });

          if (!message) {
            socket.emit("error", "Message not found or not authorized");
            return;
          }

          await db.message.delete({
            where: { id: data.messageId },
          });

          io.to(`team:${message.teamId}`).emit("message:deleted", data.messageId);
        } catch (error) {
          console.error("Error deleting message:", error);
          socket.emit("error", "Failed to delete message");
        }
      });

      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
      });
    });

    res.socket.server.io = io;
  }

  res.end();
};
