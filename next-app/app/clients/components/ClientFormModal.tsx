"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/Dialog";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { createClientAction, updateClientAction } from "../actions";
import { Label } from "@/app/components/ui/label";
import {
  validateEmail,
  validateThaiTaxId,
  validatePhone,
} from "@/lib/validation";
import {
  toastCreateSuccess,
  toastUpdateSuccess,
  toastError,
} from "@/lib/toast-utils";

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  taxId?: string;
  address?: string;
  notes?: string;
}

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client | null;
  onSuccess: () => void;
}

export default function ClientFormModal({
  isOpen,
  onClose,
  client,
  onSuccess,
}: ClientFormModalProps) {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<Partial<Client>>();

  useEffect(() => {
    if (client) {
      setValue("name", client.name);
      setValue("email", client.email);
      setValue("phone", client.phone);
      setValue("address", client.address);
      setValue("taxId", client.taxId);
    } else {
      reset({
        name: "",
        email: "",
        phone: "",
        address: "",
        taxId: "",
      });
    }
  }, [client, isOpen, reset, setValue]);

  const onSubmit = async (data: Partial<Client>) => {
    try {
      setLoading(true);

      const payload = {
        name: data.name!,
        email: data.email || "",
        phone: data.phone || "",
        taxId: data.taxId || "",
        address: data.address || "",
        notes: data.notes || "",
      };

      if (client?.id) {
        const result = await updateClientAction(client.id, payload);
        if (result.error) throw new Error(result.error);
        toastUpdateSuccess("Client");
      } else {
        const result = await createClientAction(payload);
        if (result.error) throw new Error(result.error);
        toastCreateSuccess("Client");
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Client form error:", error);
      toastError("save", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{client ? "Edit Client" : "New Client"}</DialogTitle>
          <DialogDescription>
            {client
              ? "Update client details."
              : "Add a new client organization to the system."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Client Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              {...register("name", { required: "Name is required" })}
              placeholder="Company Name Co., Ltd."
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                {...register("email", {
                  validate: (value) => {
                    if (!value) return true; // Optional
                    if (!validateEmail(value)) return "Invalid email format";
                    return true;
                  },
                })}
                placeholder="contact@company.com"
                type="email"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                {...register("phone", {
                  validate: (value) => {
                    if (!value) return true; // Optional
                    if (!validatePhone(value))
                      return "Invalid phone format (e.g., 02-xxx-xxxx)";
                    return true;
                  },
                })}
                placeholder="02-xxx-xxxx"
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxId">Tax ID (13 digits)</Label>
            <Input
              id="taxId"
              {...register("taxId", {
                validate: (value) => {
                  if (!value) return true; // Optional
                  if (!validateThaiTaxId(value))
                    return "Tax ID must be exactly 13 digits";
                  return true;
                },
              })}
              placeholder="1234567890123"
              maxLength={13}
              className={errors.taxId ? "border-red-500" : ""}
            />
            {errors.taxId && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.taxId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              {...register("address")}
              placeholder="123 Street, City, Country"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Saving..."
                : client
                  ? "Save Changes"
                  : "Create Client"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
