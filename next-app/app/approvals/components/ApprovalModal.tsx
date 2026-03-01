"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";

interface ApprovalModalProps {
  isOpen: boolean;
  mode: "approve" | "reject";
  label?: string;
  onClose: () => void;
  onConfirm: (reason?: string) => Promise<void> | void;
}

export default function ApprovalModal({
  isOpen,
  mode,
  label,
  onClose,
  onConfirm,
}: ApprovalModalProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!isOpen) setReason("");
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{mode === "approve" ? "อนุมัติ" : "ปฏิเสธ"}</DialogTitle>
          <DialogDescription>
            {mode === "approve"
              ? "ยืนยันการอนุมัติรายการนี้"
              : "กรุณาระบุเหตุผลการปฏิเสธ (ถ้ามี)"}
            {label ? ` - ${label}` : ""}
          </DialogDescription>
        </DialogHeader>

        {mode === "reject" && (
          <div className="space-y-2 py-2">
            <label className="text-sm text-slate-700">เหตุผลการปฏิเสธ</label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="ระบุเหตุผล..."
            />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" type="button" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button
            type="button"
            className={
              mode === "approve"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }
            disabled={mode === "reject" && !reason}
            onClick={() => onConfirm(reason || undefined)}
          >
            {mode === "approve" ? "อนุมัติ" : "ปฏิเสธ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
