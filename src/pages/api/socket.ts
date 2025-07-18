import { NextApiRequest } from "next";
import { NextApiResponseServerIO, initSocket } from "@/lib/socket";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO,
) {
  if (req.method === "GET" || req.method === "POST") {
    try {
      initSocket(req, res);
      res.status(200).end();
    } catch (error) {
      console.error("Error initializing Socket.IO server:", error);
      res.status(500).json({ error: "Socket.IO initialization failed" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}; 