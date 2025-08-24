import { NextApiRequest } from "next";
import { NextApiResponse } from "next";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Socket functionality is disabled
  res.status(503).json({ error: "Socket functionality is disabled" });
}

export const config = {
  api: {
    bodyParser: false,
  },
}; 