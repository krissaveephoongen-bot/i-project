/**
 * EXAMPLE: Complete Authentication Flow
 * This file demonstrates the proper auth implementation
 *
 * DO NOT use this in production - it's for documentation
 */

// ============================================================================
// BACKEND: Protected API Route Example
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { verifyAuth, isManagerOrAdmin } from "@/lib/auth-middleware";
import { supabase } from "@/app/lib/supabaseClient";

/**
 * Example: Get user's projects (requires authentication)
 */
export async function GET_PROTECTED_EXAMPLE(request: NextRequest) {
  // Step 1: Verify authentication
  const { user, response } = await verifyAuth(request);
  if (!user) return response;

  // Step 2: Optional - Check role
  if (!isManagerOrAdmin(user.role)) {
    return NextResponse.json(
      { error: "Only managers and admins can access this" },
      { status: 403 },
    );
  }

  // Step 3: Fetch data
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("manager_id", user.id);

  // Step 4: Return response
  return NextResponse.json({
    user: user.id,
    projects: projects || [],
    message: "Projects retrieved successfully",
  });
}

// ============================================================================
// FRONTEND: Login Component Example
// ============================================================================

/**
 * 'use client';
 *
 * import { useState } from 'react';
 * import { useRouter } from 'next/navigation';
 * import { useAuthToken } from '@/hooks/useAuthToken';
 *
 * export function LoginForm() {
 *   const [email, setEmail] = useState('');
 *   const [password, setPassword] = useState('');
 *   const [loading, setLoading] = useState(false);
 *   const [error, setError] = useState('');
 *   const auth = useAuthToken();
 *   const router = useRouter();
 *
 *   const handleLogin = async (e: React.FormEvent) => {
 *     e.preventDefault();
 *     setLoading(true);
 *     setError('');
 *
 *     try {
 *       const response = await fetch('/api/auth/login', {
 *         method: 'POST',
 *         headers: { 'Content-Type': 'application/json' },
 *         body: JSON.stringify({ email, password })
 *       });
 *
 *       const data = await response.json();
 *
 *       if (!response.ok) {
 *         setError(data.error || 'Login failed');
 *         return;
 *       }
 *
 *       // Store tokens
 *       auth.setTokens({
 *         accessToken: data.tokens.accessToken,
 *         refreshToken: data.tokens.refreshToken
 *       });
 *
 *       // Redirect to dashboard
 *       router.push('/dashboard');
 *     } catch (err) {
 *       setError('Network error. Please try again.');
 *     } finally {
 *       setLoading(false);
 *     }
 *   };
 *
 *   return (
 *     <form onSubmit={handleLogin}>
 *       {error && <div className="error">{error}</div>}
 *       <input
 *         type="email"
 *         placeholder="Email"
 *         value={email}
 *         onChange={(e) => setEmail(e.target.value)}
 *       />
 *       <input
 *         type="password"
 *         placeholder="Password"
 *         value={password}
 *         onChange={(e) => setPassword(e.target.value)}
 *       />
 *       <button type="submit" disabled={loading}>
 *         {loading ? 'Logging in...' : 'Login'}
 *       </button>
 *     </form>
 *   );
 * }
 */

// ============================================================================
// FRONTEND: API Request Example
// ============================================================================

/**
 * 'use client';
 *
 * import { useEffect, useState } from 'react';
 * import { api } from '@/lib/api-client';
 *
 * export function ProjectsList() {
 *   const [projects, setProjects] = useState([]);
 *   const [loading, setLoading] = useState(true);
 *   const [error, setError] = useState('');
 *
 *   useEffect(() => {
 *     const fetchProjects = async () => {
 *       try {
 *         // This automatically:
 *         // 1. Adds Authorization header with token
 *         // 2. Refreshes token on 401
 *         // 3. Parses response JSON
 *         const result = await api.get('/api/projects');
 *
 *         if (result.ok) {
 *           setProjects(result.data || []);
 *         } else {
 *           setError(result.error);
 *         }
 *       } finally {
 *         setLoading(false);
 *       }
 *     };
 *
 *     fetchProjects();
 *   }, []);
 *
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *
 *   return (
 *     <ul>
 *       {projects.map((p) => (
 *         <li key={p.id}>{p.name}</li>
 *       ))}
 *     </ul>
 *   );
 * }
 */

// ============================================================================
// FRONTEND: Auth Provider Setup Example
// ============================================================================

/**
 * 'use client';
 *
 * import { useEffect } from 'react';
 * import { useAuthToken } from '@/hooks/useAuthToken';
 * import { initializeApiClient } from '@/lib/api-client';
 *
 * export function AuthProvider({ children }: { children: React.ReactNode }) {
 *   const auth = useAuthToken();
 *
 *   // Initialize API client with auth functions
 *   useEffect(() => {
 *     initializeApiClient(
 *       () => auth.getAccessToken(),
 *       () => auth.refreshAccessToken()
 *     );
 *   }, [auth]);
 *
 *   if (auth.isLoading) return <div>Loading...</div>;
 *
 *   return <>{children}</>;
 * }
 */

// ============================================================================
// CURL Examples
// ============================================================================

/**
 * 1. LOGIN
 * curl -X POST http://localhost:3000/api/auth/login \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "email": "user@example.com",
 *     "password": "password123"
 *   }'
 *
 * Response:
 * {
 *   "user": { "id": "...", "email": "...", "role": "..." },
 *   "tokens": {
 *     "accessToken": "eyJhbGc...",
 *     "refreshToken": "eyJhbGc...",
 *     "expiresIn": 86400
 *   },
 *   "sessionId": "...",
 *   "message": "Login successful"
 * }
 *
 * -----------------------------------------------------------------------
 *
 * 2. VERIFY TOKEN
 * curl -X GET http://localhost:3000/api/auth/verify \
 *   -H "Authorization: Bearer <accessToken>"
 *
 * Response:
 * {
 *   "valid": true,
 *   "user": { "id": "...", "email": "...", "role": "..." },
 *   "message": "Token is valid"
 * }
 *
 * -----------------------------------------------------------------------
 *
 * 3. REFRESH TOKEN
 * curl -X POST http://localhost:3000/api/auth/refresh \
 *   -H "Authorization: Bearer <refreshToken>"
 *
 * Response:
 * {
 *   "accessToken": "eyJhbGc...",
 *   "expiresIn": 86400,
 *   "message": "Token refreshed successfully"
 * }
 *
 * -----------------------------------------------------------------------
 *
 * 4. LOGOUT
 * curl -X POST http://localhost:3000/api/auth/logout \
 *   -H "Authorization: Bearer <accessToken>"
 *
 * Response:
 * {
 *   "message": "Logout successful"
 * }
 *
 * -----------------------------------------------------------------------
 *
 * 5. ACCESS PROTECTED ENDPOINT
 * curl -X GET http://localhost:3000/api/projects \
 *   -H "Authorization: Bearer <accessToken>"
 *
 * Response:
 * {
 *   "projects": [...],
 *   "message": "Projects retrieved successfully"
 * }
 */

// ============================================================================
// Database Schema Examples
// ============================================================================

/**
 * AUTH_TOKENS Table Structure:
 *
 * | id | user_id | token | token_type | expires_at | revoked_at | created_at |
 * |----|---------|-------|------------|-----------|-----------|-----------|
 * | UUID | UUID | JWT string | 'access' | 2024-02-12 10:00 | NULL | 2024-02-11 10:00 |
 * | UUID | UUID | JWT string | 'refresh' | 2024-02-18 10:00 | NULL | 2024-02-11 10:00 |
 *
 * -----------------------------------------------------------------------
 *
 * SESSIONS Table Structure:
 *
 * | id | user_id | ip_address | user_agent | last_activity | expires_at | created_at |
 * |----|---------|-----------|-----------|-------------|-----------|-----------|
 * | UUID | UUID | 192.168.1.1 | Mozilla/5.0... | 2024-02-11 10:00 | 2024-02-18 10:00 | 2024-02-11 10:00 |
 */

// ============================================================================
// Error Handling Examples
// ============================================================================

/**
 * Error Codes & Status Codes:
 *
 * 400 Bad Request
 * - Missing email/password in login
 * - Invalid request format
 *
 * 401 Unauthorized
 * - MISSING_AUTH_HEADER: No Authorization header provided
 * - INVALID_AUTH_FORMAT: Wrong header format (not "Bearer <token>")
 * - INVALID_TOKEN: Token is malformed or expired
 * - TOKEN_REVOKED: Token has been revoked
 * - USER_NOT_FOUND: User associated with token doesn't exist
 * - USER_INACTIVE: User account is deactivated or deleted
 * - Invalid email or password: Login failed
 *
 * 403 Forbidden
 * - User doesn't have required role/permissions
 *
 * 423 Locked
 * - Account is temporarily locked (5 failed login attempts)
 *
 * 500 Internal Server Error
 * - Unexpected server error
 */

export {};
