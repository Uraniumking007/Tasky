"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { CreateNoteModal } from "@/components/modals/create-note-modal";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  User,
  Users,
  Lock,
  Unlock,
  Calendar,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type NoteType = {
  id: string;
  title: string;
  content: string | null;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  subjectId: string | null;
  teamId: string | null;
  author: {
    id: string;
    name: string | null;
    email: string | null;
    username: string | null;
  };
  subject: {
    id: string;
    name: string | null;
    email: string | null;
    username: string | null;
  } | null;
  team: {
    id: string;
    name: string;
  } | null;
};

type EditNoteType = {
  id: string;
  title: string;
  content?: string | null;
  isPrivate: boolean;
  subjectId?: string | null;
};

interface NotesListProps {
  teamId?: string;
  organizationId?: string; // Organization context for permissions
  subjectId?: string; // To show notes about a specific user
  title?: string;
  showCreateButton?: boolean;
  canCreateNotes?: boolean;
}

export function NotesList({
  teamId,
  organizationId,
  subjectId,
  title = "Notes",
  showCreateButton = true,
  canCreateNotes = true,
}: NotesListProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingNote, setEditingNote] = useState<EditNoteType | null>(null);
  const [deletingNote, setDeletingNote] = useState<EditNoteType | null>(null);

  // Get notes query
  const {
    data: notes,
    isLoading,
    error,
    refetch,
  } = api.notes.getNotes.useQuery(
    {
      teamId,
      organizationId,
      subjectId,
      includePrivate: true,
    },
    {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  );

  // Delete mutation
  const deleteNoteMutation = api.notes.deleteNote.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
      refetch();
      setDeletingNote(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete note",
        variant: "destructive",
      });
    },
  });

  // Filter notes based on search term
  const filteredNotes =
    notes?.filter(
      (note: NoteType) =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content?.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

  const handleNoteCreated = () => {
    refetch();
    setShowCreateModal(false);
    setEditingNote(null);
  };

  const handleEdit = (note: EditNoteType) => {
    setEditingNote({
      id: note.id,
      title: note.title,
      content: note.content ?? undefined,
      isPrivate: note.isPrivate,
      subjectId: note.subjectId,
    });
    setShowCreateModal(true);
  };

  const handleDelete = (note: EditNoteType) => {
    setDeletingNote(note);
  };

  const confirmDelete = () => {
    if (deletingNote) {
      deleteNoteMutation.mutate({ noteId: deletingNote.id });
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading notes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <h3 className="font-medium text-destructive">Error loading notes</h3>
        <p className="text-sm text-destructive/80">
          {error.message || "Failed to load notes"}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="mt-2"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
        {showCreateButton && canCreateNotes && (
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Note
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Notes List */}
      {filteredNotes.length === 0 ? (
        <div className="py-12 text-center">
          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No notes found</h3>
          <p className="text-muted-foreground">
            {searchTerm
              ? "No notes match your search criteria."
              : "Get started by creating your first note."}
          </p>
          {showCreateButton && canCreateNotes && !searchTerm && (
            <Button
              onClick={() => setShowCreateModal(true)}
              className="mt-4"
              variant="outline"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Note
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredNotes.map((note: NoteType) => (
            <Card key={note.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{note.title}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Created {formatDate(note.createdAt)}</span>
                      {note.updatedAt !== note.createdAt && (
                        <span>• Updated {formatDate(note.updatedAt)}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Privacy Badge */}
                      <Badge variant={note.isPrivate ? "secondary" : "outline"}>
                        {note.isPrivate ? (
                          <>
                            <Lock className="mr-1 h-3 w-3" />
                            Private
                          </>
                        ) : (
                          <>
                            <Unlock className="mr-1 h-3 w-3" />
                            Public
                          </>
                        )}
                      </Badge>

                      {/* Author Badge */}
                      <Badge variant="outline">
                        <User className="mr-1 h-3 w-3" />
                        By{" "}
                        {note.author.name || note.author.username || "Unknown"}
                      </Badge>

                      {/* Subject Badge (if note is about someone else) */}
                      {note.subject && note.subjectId !== note.authorId && (
                        <Badge variant="outline">
                          <Users className="mr-1 h-3 w-3" />
                          About{" "}
                          {note.subject.name ||
                            note.subject.username ||
                            "Unknown"}
                        </Badge>
                      )}

                      {/* Team Badge */}
                      {note.team && (
                        <Badge variant="outline">Team: {note.team.name}</Badge>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(note as EditNoteType)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(note as EditNoteType)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {note.content && (
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                    {note.content}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <CreateNoteModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingNote(null);
        }}
        teamId={teamId}
        organizationId={organizationId}
        defaultSubjectId={subjectId} // Pass the subjectId as default subject
        editNote={
          editingNote
            ? {
                ...editingNote,
                content: editingNote.content ?? undefined,
                subjectId: editingNote.subjectId ?? undefined,
              }
            : undefined
        }
        onNoteCreated={handleNoteCreated}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingNote} onOpenChange={() => setDeletingNote(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingNote?.title}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingNote(null)}
              disabled={deleteNoteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteNoteMutation.isPending}
            >
              {deleteNoteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
