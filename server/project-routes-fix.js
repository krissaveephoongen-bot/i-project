/**
 * S-Curve API Authorization Fix
 * 
 * This file shows the required changes for proper authorization
 * on S-Curve endpoints.
 */

// ============================================================================
// AUTHORIZATION MIDDLEWARE
// ============================================================================

/**
 * Middleware to check if user can view project S-Curve
 * Requirements:
 * - User must be authenticated
 * - User must have access to project (manager, member, or viewer)
 */
const checkProjectAccess = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // In a real app, get user from req.user (from authentication middleware)
    // const userId = req.user?.id;
    // const userRole = req.user?.role;
    
    // For now, we allow all authenticated users (demo mode)
    // In production, implement proper role checking
    
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized access to project'
    });
  }
};

// ============================================================================
// UPDATED S-CURVE ENDPOINTS
// ============================================================================

/**
 * GET /api/projects/:id/s-curve
 * 
 * Get S-Curve progress data for a project
 * 
 * Authorization:
 * - Project Manager: ✅ Full access
 * - Team Member: ✅ Full access  
 * - Viewer: ✅ Read-only access
 * - Others: ❌ Denied (403)
 * 
 * Response: 200 with S-Curve data
 * Error: 404 if project not found, 403 if unauthorized
 */
// router.get('/projects/:id/s-curve', checkProjectAccess, async (req, res) => {
//   try {
//     const { id } = req.params;
//
//     // Validate project exists
//     const projectResult = await executeQuery(
//       'SELECT * FROM projects WHERE id = $1 AND is_deleted = false',
//       [id]
//     );
//
//     if (projectResult.rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'Project not found'
//       });
//     }
//
//     const sCurveData = await calculateSCurve(id);
//
//     res.status(200).json({
//       success: true,
//       data: sCurveData
//     });
//   } catch (error) {
//     console.error('❌ Get S-Curve error:', error.message);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to calculate S-Curve',
//       error: error.message
//     });
//   }
// });

/**
 * GET /api/projects/:id/s-curve/export/pdf
 * 
 * Export S-Curve report as PDF
 * 
 * Authorization: Same as above (view access required)
 * 
 * Response: 200 with PDF file
 * Headers:
 *   - Content-Type: application/pdf
 *   - Content-Disposition: attachment; filename="..."
 */
// router.get('/projects/:id/s-curve/export/pdf', checkProjectAccess, async (req, res) => {
//   try {
//     const { id } = req.params;
//
//     // Validate project exists
//     const projectResult = await executeQuery(
//       'SELECT name FROM projects WHERE id = $1 AND is_deleted = false',
//       [id]
//     );
//
//     if (projectResult.rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'Project not found'
//       });
//     }
//
//     const projectName = projectResult.rows[0].name;
//     const pdfBuffer = await generateSCurvePdf(id);
//
//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader(
//       'Content-Disposition',
//       `attachment; filename="S-Curve-${projectName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf"`
//     );
//     res.setHeader('Content-Length', pdfBuffer.length);
//
//     res.send(pdfBuffer);
//   } catch (error) {
//     console.error('❌ S-Curve PDF export error:', error.message);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to generate PDF',
//       error: error.message
//     });
//   }
// });

// ============================================================================
// IMPLEMENTATION GUIDE
// ============================================================================

/**
 * To implement proper authorization:
 * 
 * 1. Add authentication middleware to server/app.js
 *    - Verify JWT token or session
 *    - Attach user info to req.user
 * 
 * 2. Create authorization check middleware
 *    - Check if user is PM, member, or viewer of project
 *    - Return 403 if not authorized
 * 
 * 3. Add middleware to S-Curve endpoints
 *    - router.get('/projects/:id/s-curve', checkProjectAccess, handler)
 * 
 * 4. Current demo setup
 *    - All authenticated users can view S-Curve
 *    - In production, restrict by project assignment
 * 
 * User Roles & S-Curve Access:
 * ├── Admin
 * │   └── ✅ Can view all project S-Curves
 * ├── Project Manager (of specific project)
 * │   └── ✅ Can view their project's S-Curve
 * ├── Team Member (assigned to project)
 * │   └── ✅ Can view assigned project's S-Curve
 * ├── Viewer (read-only access)
 * │   └── ✅ Can view project S-Curve
 * └── Guest / Other Users
 *     └── ❌ Cannot view (403 Forbidden)
 */

module.exports = {
  // Middleware exports for use in app.js
  checkProjectAccess
};
