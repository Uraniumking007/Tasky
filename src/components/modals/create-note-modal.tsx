"use client";

import { useState, useEffect } from "react";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, User, Users } from "lucide-react";

interface CreateNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId?: string;
  organizationId?: string; // Organization context for permissions
  defaultSubjectId?: string; // Pre-fill the subject (e.g., when creating note about specific user)
  editNote?: {
    id: string;
    title: string;
    content?: string;
    isPrivate: boolean;
    subjectId?: string;
  } | null;
  onNoteCreated?: () => void;
}

export function CreateNoteModal({
  isOpen,
  onClose,
  teamId,
  organizationId,
  defaultSubjectId,
  editNote,
  onNoteCreated,
}: CreateNoteModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);
  const [subjectId, setSubjectId] = useState<string>("");

  // Get team members if teamId is provided
  const {
    data: teamMembers,
    isLoading: isLoadingMembers,
    error: membersError,
  } = api.notes.getTeamMembers.useQuery(
    { teamId: teamId! },
    {
      enabled: !!teamId && isOpen,
      retry: 1,
    },
  );

  // Get current user session
  const { data: session } = useSession();

  // Reset form when modal opens/closes or editNote changes
  useEffect(() => {
    if (isOpen) {
      if (editNote) {
        setTitle(editNote.title);
        setContent(editNote.content || "");
        setIsPrivate(editNote.isPrivate);
        setSubjectId(editNote.subjectId || "");
      } else {
        setTitle("");
        setContent("");
        setIsPrivate(true);

        // Set default subject - use defaultSubjectId if provided, otherwise exclude current user
        if (defaultSubjectId) {
          // Use the provided default subject (e.g., from member details modal)
          setSubjectId(defaultSubjectId);
        } else if (teamMembers && session?.user?.email) {
          // Filter out current user from team members since self notes aren't allowed
          const otherMembers = teamMembers.filter(
            (member) => member.email !== session.user.email,
          );

          if (otherMembers.length > 0 && otherMembers[0]) {
            // Default to first available team member (excluding self)
            setSubjectId(otherMembers[0].id);
          } else {
            // No other members available
            setSubjectId("");
          }
        } else {
          setSubjectId("");
        }
      }
    }
  }, [isOpen, editNote, teamMembers, session?.user?.email, defaultSubjectId]);

  const createNoteMutation = api.notes.createNote.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Note created successfully",
      });
      onNoteCreated?.();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create note",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const updateNoteMutation = api.notes.updateNote.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Note updated successfully",
      });
      onNoteCreated?.();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update note",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for the note",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    if (editNote) {
      updateNoteMutation.mutate({
        noteId: editNote.id,
        title: title.trim(),
        content: content.trim() || undefined,
        isPrivate,
      });
    } else {
      createNoteMutation.mutate({
        title: title.trim(),
        content: content.trim() || undefined,
        isPrivate,
        subjectId: subjectId || undefined,
        teamId,
        organizationId,
      });
    }
  };

  const isLoading = isSubmitting || isLoadingMembers;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {editNote ? (
              <>
                <User className="h-5 w-5" />
                Edit Note
              </>
            ) : (
              <>
                <Users className="h-5 w-5" />
                Create Note
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {editNote
              ? "Update the note details below."
              : teamId
                ? "Create a note for yourself or a team member."
                : "Create a personal note."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Field */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title"
              disabled={isLoading}
              required
            />
          </div>

          {/* Subject Selection (only for team notes and when creating) */}
          {teamId && !editNote && teamMembers && teamMembers.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="subject">Note Subject</Label>
              <Select
                value={subjectId}
                onValueChange={setSubjectId}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select team member to write note about" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers
                    .filter(
                      (member) =>
                        member.id &&
                        member.id.trim() !== "" &&
                        member.email !== session?.user?.email, // Exclude current user
                    )
                    .map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        <div className="flex items-center gap-2">
                          <span>{member.name || "Unknown User"}</span>
                          <span className="text-xs text-muted-foreground">
                            ({member.role.replace("_", " ")})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  {teamMembers?.filter(
                    (member) => member.email !== session?.user?.email,
                  ).length === 0 && (
                    <div className="p-2 text-sm text-muted-foreground">
                      No other team members available
                    </div>
                  )}
                </SelectContent>
              </Select>
              {membersError && (
                <p className="text-xs text-destructive">
                  Failed to load team members. You can still create a personal
                  note.
                </p>
              )}
            </div>
          )}

          {/* Content Field */}
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setContent(e.target.value)
              }
              placeholder="Enter note content..."
              rows={6}
              disabled={isLoading}
            />
          </div>

          {/* Privacy Setting */}
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-1">
              <Label htmlFor="privacy">Private Note</Label>
              <p className="text-xs text-muted-foreground">
                Private notes are only visible to you and organization owners
              </p>
            </div>
            <Switch
              id="privacy"
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
              disabled={isLoading}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editNote ? "Update Note" : "Create Note"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
