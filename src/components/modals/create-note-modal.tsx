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

        // Set default subject - use defaultSubjectId if provided, otherwise default to personal note
        if (defaultSubjectId) {
          // Use the provided default subject (e.g., from member details modal)
          setSubjectId(defaultSubjectId);
        } else {
          // Default to personal note (empty string means about self)
          setSubjectId("");
        }
      }
    }
  }, [isOpen, editNote, session?.user?.email, defaultSubjectId]);

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

  const isLoading = isSubmitting;

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
              : "Create a note about this member."}
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
