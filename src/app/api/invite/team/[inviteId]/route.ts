import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { inviteId: string } },
) {
  try {
    const { inviteId } = params;

    // Get the invitation with team and inviter details
    const invitation = await db.teamInvite.findUnique({
      where: { id: inviteId },
      include: {
        team: {
          include: {
            organization: true,
          },
        },
        inviter: {
          select: {
            name: true,
            username: true,
          },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { success: false, message: "Invitation not found" },
        { status: 404 },
      );
    }

    // Check if invitation is expired
    if (invitation.expiry < new Date()) {
      return NextResponse.json(
        { success: false, message: "This invitation has expired" },
        { status: 410 },
      );
    }

    // Check if invitation is already accepted/cancelled
    if (invitation.status !== "pending") {
      return NextResponse.json(
        {
          success: false,
          message: `This invitation has been ${invitation.status}`,
        },
        { status: 410 },
      );
    }

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        teamName: invitation.team.name,
        organizationName: invitation.team.organization?.name,
        inviterName: invitation.inviter.name || invitation.inviter.username,
        expiry: invitation.expiry,
      },
    });
  } catch (error) {
    console.error("Error fetching invitation:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { inviteId: string } },
) {
  try {
    const { inviteId } = params;
    const { action, userId } = await request.json();

    if (!action || !userId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    // Get the invitation
    const invitation = await db.teamInvite.findUnique({
      where: { id: inviteId },
      include: {
        team: true,
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { success: false, message: "Invitation not found" },
        { status: 404 },
      );
    }

    // Check if invitation is expired
    if (invitation.expiry < new Date()) {
      return NextResponse.json(
        { success: false, message: "This invitation has expired" },
        { status: 410 },
      );
    }

    // Check if invitation is already processed
    if (invitation.status !== "pending") {
      return NextResponse.json(
        {
          success: false,
          message: `This invitation has already been ${invitation.status}`,
        },
        { status: 410 },
      );
    }

    // Verify the user exists
    const user = await db.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    // Verify the user's email matches the invitation
    if (user.email !== invitation.email) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Email mismatch. This invitation was sent to a different email address.",
        },
        { status: 403 },
      );
    }

    if (action === "accept") {
      // Check if user is already a member
      const existingMember = await db.teamMember.findFirst({
        where: {
          teamId: invitation.teamId,
          userId: userId,
        },
      });

      if (existingMember) {
        return NextResponse.json(
          { success: false, message: "You are already a member of this team" },
          { status: 409 },
        );
      }

      // Add user to team and mark invitation as accepted
      await db.$transaction([
        db.teamMember.create({
          data: {
            teamId: invitation.teamId,
            userId: userId,
            role: "MEMBER",
          },
        }),
        db.teamInvite.update({
          where: { id: inviteId },
          data: { status: "accepted" },
        }),
      ]);

      return NextResponse.json({
        success: true,
        message: "Successfully joined the team",
        teamId: invitation.teamId,
      });
    } else if (action === "decline") {
      // Mark invitation as declined
      await db.teamInvite.update({
        where: { id: inviteId },
        data: { status: "declined" },
      });

      return NextResponse.json({
        success: true,
        message: "Invitation declined",
      });
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid action" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Error processing invitation:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
