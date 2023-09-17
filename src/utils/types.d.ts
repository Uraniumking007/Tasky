import type { User } from "@prisma/client";
import type { AdapterUser } from "next-auth/adapters";

export interface SessionUserTypes extends User, AdapterUser {
  id: string;
  username: string;
}
