import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function RowActions({
  onDelete, editForm, editTitle = "Edit", deleteLabel = "Hapus",
  confirmText = "Data akan dihapus permanen. Lanjutkan?",
  align = "end",
}: {
  onDelete?: () => Promise<void> | void;
  editForm?: (close: () => void) => ReactNode;
  editTitle?: string;
  deleteLabel?: string;
  confirmText?: string;
  align?: "start" | "end";
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const doDelete = async () => {
    if (!onDelete) return;
    setBusy(true);
    try { await onDelete(); toast.success("Dihapus"); setDelOpen(false); }
    catch (e: any) { toast.error(e.message ?? "Gagal menghapus"); }
    finally { setBusy(false); }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-7" onClick={(e)=>e.stopPropagation()}>
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={align}>
          {editForm && (
            <DropdownMenuItem onSelect={(e)=>{e.preventDefault(); setEditOpen(true);}}>
              <Pencil className="size-3.5 mr-2" /> Edit
            </DropdownMenuItem>
          )}
          {onDelete && (
            <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={(e)=>{e.preventDefault(); setDelOpen(true);}}>
              <Trash2 className="size-3.5 mr-2" /> {deleteLabel}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {editForm && (
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editTitle}</DialogTitle>
              <DialogDescription className="sr-only">{editTitle}</DialogDescription>
            </DialogHeader>
            {editForm(() => setEditOpen(false))}
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={delOpen} onOpenChange={setDelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>{confirmText}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Batal</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy}
              onClick={(e)=>{ e.preventDefault(); void doDelete(); }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {busy ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}