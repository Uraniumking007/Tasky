"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { acceptOrganizationInvite, declineOrganizationInvite } from "./actions";
import { useRouter } from "next/navigation";

interface AcceptOrganizationInviteButtonProps {
  inviteId: string;
  userId: string;
}

export function AcceptOrganizationInviteButton({
  inviteId,
  userId,
}: AcceptOrganizationInviteButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAccept = async () => {
    setIsLoading(true);

    try {
      const result = await acceptOrganizationInvite(inviteId, userId);

      if (result.success) {
        toast({
          title: "Invitation accepted!",
          description: result.message,
        });

        // Redirect to organization page or home
        if (result.redirectTo) {
          router.push(result.redirectTo);
        } else {
          router.push("/home");
        }
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleAccept} disabled={isLoading} className="w-full">
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Accepting...
        </>
      ) : (
        <>
          <CheckCircle className="mr-2 h-4 w-4" />
          Accept Invitation
        </>
      )}
    </Button>
  );
}

interface DeclineOrganizationInviteButtonProps {
  inviteId: string;
  userId: string;
}

export function DeclineOrganizationInviteButton({
  inviteId,
  userId,
}: DeclineOrganizationInviteButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleDecline = async () => {
    if (!confirm("Are you sure you want to decline this invitation?")) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await declineOrganizationInvite(inviteId, userId);

      if (result.success) {
        toast({
          title: "Invitation declined",
          description: result.message,
        });

        // Redirect to home
        router.push("/home");
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to decline invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleDecline}
      disabled={isLoading}
      variant="outline"
      className="w-full"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Declining...
        </>
      ) : (
        <>
          <XCircle className="mr-2 h-4 w-4" />
          Decline Invitation
        </>
      )}
    </Button>
  );
}
