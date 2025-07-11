import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/server/auth";
import { clearSettingsCookies } from "@/lib/settings";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerAuthSession();
    
    if (session?.user) {
      // Clear settings cookies
      await clearSettingsCookies();
    }

    // Return success response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in logout route:", error);
    return NextResponse.json(
      { error: "Failed to logout" },
      { status: 500 }
    );
  }
} 