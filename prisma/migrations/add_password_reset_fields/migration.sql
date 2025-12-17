-- Add password reset fields to User table
ALTER TABLE "User" ADD COLUMN "resetToken" TEXT,
ADD COLUMN "resetTokenExpires" TIMESTAMPTZ;

-- Optional: Add index for faster reset token lookups
CREATE INDEX "User_resetToken_idx" ON "User"("resetToken");
