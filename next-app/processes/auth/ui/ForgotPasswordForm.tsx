"use client";

import { useState } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import { useAuth } from "../model/useAuth";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import type { ForgotPasswordFormData } from "../model/types";

interface ForgotPasswordFormProps {
  onSwitchToLogin?: () => void;
  onSuccess?: () => void;
}

export function ForgotPasswordForm({
  onSwitchToLogin,
  onSuccess,
}: ForgotPasswordFormProps) {
  const { forgotPassword, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: "",
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ email: e.target.value });
    if (error) clearError();
    if (successMessage) setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await forgotPassword(formData);
      setSuccessMessage(
        "If an account with that email exists, a password reset link has been sent.",
      );
      onSuccess?.();
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const isFormValid =
    formData.email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Reset Password
        </CardTitle>
        <CardDescription className="text-center">
          Enter your email address and we'll send you a link to reset your
          password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert>
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleInputChange}
              disabled={isLoading}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending reset link...
              </>
            ) : (
              "Send Reset Link"
            )}
          </Button>

          {onSwitchToLogin && (
            <div className="text-center">
              <button
                type="button"
                className="inline-flex items-center text-sm text-primary hover:underline"
                onClick={onSwitchToLogin}
                disabled={isLoading}
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to sign in
              </button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
