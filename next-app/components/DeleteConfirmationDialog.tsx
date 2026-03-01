"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";

interface DeleteConfirmationDialogProps {
  open: boolean;
  title?: string;
  description?: string;
  entityName?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isDangerous?: boolean; // Show extra warning
}

export default function DeleteConfirmationDialog({
  open,
  title = "ยืนยันการลบ",
  description = "การกระทำนี้ไม่สามารถย้อนกลับได้",
  entityName,
  isLoading = false,
  onConfirm,
  onCancel,
  isDangerous = false,
}: DeleteConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle
            className={`flex items-center gap-2 ${isDangerous ? "text-red-600" : "text-slate-900"}`}
          >
            <AlertTriangle className="w-5 h-5" />
            {title}
          </DialogTitle>
          <DialogDescription className="pt-2 space-y-2">
            <p>{description}</p>
            {entityName && (
              <p className="text-sm font-semibold text-slate-700 bg-slate-50 px-3 py-2 rounded">
                {entityName}
              </p>
            )}
            {isDangerous && (
              <p className="text-sm text-red-600 font-medium">
                ⚠️ การดำเนินการนี้จะลบข้อมูลถาวร และไม่สามารถกู้คืนได้
              </p>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-xl"
          >
            ยกเลิก
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-xl gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                กำลังลบ...
              </>
            ) : (
              "ยืนยันลบ"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
