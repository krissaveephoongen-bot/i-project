import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user exists
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .eq("isDeleted", false)
      .single();

    if (error || !user) {
      // Don't reveal if email exists or not for security
      return NextResponse.json({
        message:
          "If an account with that email exists, a password reset link has been sent.",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Update user with reset token
    await supabase
      .from("users")
      .update({
        resetToken,
        resetTokenExpiry: resetTokenExpiry.toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .eq("id", user.id);

    // In a real application, you would:
    // 1. Send an email with the reset link containing the token
    // 2. The reset link would point to a reset password page
    // 3. The page would call a verify/reset password API

    // For now, we'll just return success
    // In production, you would integrate with an email service like SendGrid, Nodemailer, etc.

    console.log(`Password reset token for ${email}: ${resetToken}`);
    console.log(
      `Reset link would be: /reset-password?token=${resetToken}&email=${email}`,
    );

    return NextResponse.json({
      message:
        "If an account with that email exists, a password reset link has been sent.",
      // For development only - remove in production
      resetToken:
        process.env.NODE_ENV === "development" ? resetToken : undefined,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
