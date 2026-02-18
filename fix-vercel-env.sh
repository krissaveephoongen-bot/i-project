#!/bin/bash
# Force update Vercel environment variables
echo "🔄 Forcing Vercel environment update..."

# Step 1: Remove existing env vars
echo "🗑️ Removing existing environment variables..."
vercel env rm NEXT_PUBLIC_SUPABASE_URL production
vercel env rm NEXT_PUBLIC_SUPABASE_ANON_KEY production  
vercel env rm SUPABASE_SERVICE_ROLE_KEY production

# Step 2: Add new env vars
echo "➕ Adding new environment variables..."
echo "https://vaunihijmwwkhqagjqjd.supabase.co" | vercel env add NEXT_PUBLIC_SUPABASE_URL production
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhdW5paGlqbXd3a2hxYWdqcWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMzE2MzcsImV4cCI6MjA4NjkwNzYzN30.bW2UPkKl_RNNBVKLzuWpvv0kjpFAaIgWoCMc02vKhHw" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhdW5paGlqbXd3a2hxYWdqcWpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMzMTYzNywiZXhwIjoyMDg2OTA3NjM3fQ.5y9iB5QK8L2eX3m7n8wR6pF9sT1kL2jH3gV4cY8wZ7k" | vercel env add SUPABASE_SERVICE_ROLE_KEY production

# Step 3: Deploy to apply changes
echo "🚀 Deploying to apply environment changes..."
vercel --prod

echo "✅ Environment update complete!"
