// backend/routes/vendor-kpi-routes.js
import express from 'express';
import { db } from '../lib/db.js';
import { vendor_kpi_evaluations, vendor_kpi_criteria, vendors, projects, users } from '../lib/schema.js';
import { eq, and, or, ilike, desc, asc, gte, lte } from 'drizzle-orm';

const router = express.Router();

// Get all KPI evaluations with filtering and pagination
router.get('/evaluations', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      vendorId, 
      projectId,
      evaluationPeriod,
      rating,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Build where conditions
    let whereConditions = [];
    
    if (search) {
      whereConditions.push(or(
        ilike(vendor_kpi_evaluations.strengths, `%${search}%`),
        ilike(vendor_kpi_evaluations.weaknesses, `%${search}%`),
        ilike(vendor_kpi_evaluations.recommendations, `%${search}%`)
      ));
    }
    
    if (vendorId) {
      whereConditions.push(eq(vendor_kpi_evaluations.vendorId, vendorId));
    }
    
    if (projectId) {
      whereConditions.push(eq(vendor_kpi_evaluations.projectId, projectId));
    }
    
    if (evaluationPeriod) {
      whereConditions.push(eq(vendor_kpi_evaluations.evaluationPeriod, evaluationPeriod));
    }

    if (rating) {
      whereConditions.push(eq(vendor_kpi_evaluations.rating, rating));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Get evaluations with related data
    const evaluations = await db.select({
      // Evaluation fields
      id: vendor_kpi_evaluations.id,
      vendorId: vendor_kpi_evaluations.vendorId,
      projectId: vendor_kpi_evaluations.projectId,
      evaluationPeriod: vendor_kpi_evaluations.evaluationPeriod,
      qualityScore: vendor_kpi_evaluations.qualityScore,
      timelinessScore: vendor_kpi_evaluations.timelinessScore,
      costScore: vendor_kpi_evaluations.costScore,
      communicationScore: vendor_kpi_evaluations.communicationScore,
      technicalScore: vendor_kpi_evaluations.technicalScore,
      overallScore: vendor_kpi_evaluations.overallScore,
      rating: vendor_kpi_evaluations.rating,
      evaluatorId: vendor_kpi_evaluations.evaluatorId,
      strengths: vendor_kpi_evaluations.strengths,
      weaknesses: vendor_kpi_evaluations.weaknesses,
      recommendations: vendor_kpi_evaluations.recommendations,
      nextEvaluationDate: vendor_kpi_evaluations.nextEvaluationDate,
      notes: vendor_kpi_evaluations.notes,
      createdAt: vendor_kpi_evaluations.createdAt,
      updatedAt: vendor_kpi_evaluations.updatedAt,
      // Vendor details
      vendorName: vendors.name,
      vendorCode: vendors.code,
      vendorType: vendors.type,
      vendorCategory: vendors.category,
      // Project details
      projectName: projects.name,
      projectCode: projects.code,
      // Evaluator details
      evaluatorName: users.name,
      evaluatorEmail: users.email
    })
    .from(vendor_kpi_evaluations)
    .leftJoin(vendors, eq(vendor_kpi_evaluations.vendorId, vendors.id))
    .leftJoin(projects, eq(vendor_kpi_evaluations.projectId, projects.id))
    .leftJoin(users, eq(vendor_kpi_evaluations.evaluatorId, users.id))
    .where(whereClause)
    .orderBy(
      sortOrder === 'desc' ? desc(vendor_kpi_evaluations[sortBy]) : asc(vendor_kpi_evaluations[sortBy])
    )
    .limit(parseInt(limit))
    .offset(offset);

    // Get total count for pagination
    const totalCount = await db.select({ count: vendor_kpi_evaluations.id })
      .from(vendor_kpi_evaluations)
      .where(whereClause);

    res.json({
      evaluations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount.length,
        pages: Math.ceil(totalCount.length / limit)
      }
    });

  } catch (error) {
    console.error('Get KPI evaluations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get KPI evaluation by ID
router.get('/evaluations/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const evaluation = await db.select({
      // Evaluation fields
      id: vendor_kpi_evaluations.id,
      vendorId: vendor_kpi_evaluations.vendorId,
      projectId: vendor_kpi_evaluations.projectId,
      evaluationPeriod: vendor_kpi_evaluations.evaluationPeriod,
      qualityScore: vendor_kpi_evaluations.qualityScore,
      timelinessScore: vendor_kpi_evaluations.timelinessScore,
      costScore: vendor_kpi_evaluations.costScore,
      communicationScore: vendor_kpi_evaluations.communicationScore,
      technicalScore: vendor_kpi_evaluations.technicalScore,
      overallScore: vendor_kpi_evaluations.overallScore,
      rating: vendor_kpi_evaluations.rating,
      evaluatorId: vendor_kpi_evaluations.evaluatorId,
      strengths: vendor_kpi_evaluations.strengths,
      weaknesses: vendor_kpi_evaluations.weaknesses,
      recommendations: vendor_kpi_evaluations.recommendations,
      nextEvaluationDate: vendor_kpi_evaluations.nextEvaluationDate,
      notes: vendor_kpi_evaluations.notes,
      createdAt: vendor_kpi_evaluations.createdAt,
      updatedAt: vendor_kpi_evaluations.updatedAt,
      // Vendor details
      vendorName: vendors.name,
      vendorCode: vendors.code,
      vendorType: vendors.type,
      vendorCategory: vendors.category,
      vendorContactPerson: vendors.contactPerson,
      vendorEmail: vendors.email,
      vendorPhone: vendors.phone,
      // Project details
      projectName: projects.name,
      projectCode: projects.code,
      projectStatus: projects.status,
      // Evaluator details
      evaluatorName: users.name,
      evaluatorEmail: users.email,
      evaluatorPosition: users.position
    })
    .from(vendor_kpi_evaluations)
    .leftJoin(vendors, eq(vendor_kpi_evaluations.vendorId, vendors.id))
    .leftJoin(projects, eq(vendor_kpi_evaluations.projectId, projects.id))
    .leftJoin(users, eq(vendor_kpi_evaluations.evaluatorId, users.id))
    .where(eq(vendor_kpi_evaluations.id, id))
    .limit(1);

    if (evaluation.length === 0) {
      return res.status(404).json({ error: 'KPI evaluation not found' });
    }

    res.json({ evaluation: evaluation[0] });

  } catch (error) {
    console.error('Get KPI evaluation details error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new KPI evaluation
router.post('/evaluations', async (req, res) => {
  try {
    const {
      vendorId,
      projectId,
      evaluationPeriod,
      qualityScore,
      timelinessScore,
      costScore,
      communicationScore,
      technicalScore,
      evaluatorId,
      strengths,
      weaknesses,
      recommendations,
      nextEvaluationDate,
      notes
    } = req.body;

    // Validate required fields
    if (!vendorId || !evaluationPeriod || !evaluatorId) {
      return res.status(400).json({ 
        error: 'Vendor ID, evaluation period, and evaluator ID are required' 
      });
    }

    // Validate scores
    const scores = [qualityScore, timelinessScore, costScore, communicationScore, technicalScore];
    for (const score of scores) {
      if (score !== undefined && (score < 1 || score > 10)) {
        return res.status(400).json({ 
          error: 'All scores must be between 1 and 10' 
        });
      }
    }

    // Check if vendor exists
    const vendorExists = await db.select()
      .from(vendors)
      .where(eq(vendors.id, vendorId))
      .limit(1);

    if (vendorExists.length === 0) {
      return res.status(400).json({ error: 'Vendor not found' });
    }

    // Check if evaluator exists
    const evaluatorExists = await db.select()
      .from(users)
      .where(eq(users.id, evaluatorId))
      .limit(1);

    if (evaluatorExists.length === 0) {
      return res.status(400).json({ error: 'Evaluator not found' });
    }

    // Check if project exists (if provided)
    if (projectId) {
      const projectExists = await db.select()
        .from(projects)
        .where(eq(projects.id, projectId))
        .limit(1);

      if (projectExists.length === 0) {
        return res.status(400).json({ error: 'Project not found' });
      }
    }

    // Calculate overall score (weighted average)
    const validScores = scores.filter(s => s !== undefined);
    const overallScore = validScores.length > 0 
      ? validScores.reduce((sum, score) => sum + score, 0) / validScores.length 
      : 0;

    // Determine rating based on overall score
    let rating;
    if (overallScore >= 9) rating = 'excellent';
    else if (overallScore >= 8) rating = 'good';
    else if (overallScore >= 6) rating = 'satisfactory';
    else if (overallScore >= 4) rating = 'needs_improvement';
    else rating = 'poor';

    const newEvaluation = {
      id: `kpi_eval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      vendorId,
      projectId: projectId || null,
      evaluationPeriod,
      qualityScore: qualityScore ? parseFloat(qualityScore) : null,
      timelinessScore: timelinessScore ? parseFloat(timelinessScore) : null,
      costScore: costScore ? parseFloat(costScore) : null,
      communicationScore: communicationScore ? parseFloat(communicationScore) : null,
      technicalScore: technicalScore ? parseFloat(technicalScore) : null,
      overallScore: parseFloat(overallScore.toFixed(1)),
      rating,
      evaluatorId,
      strengths: strengths || null,
      weaknesses: weaknesses || null,
      recommendations: recommendations || null,
      nextEvaluationDate: nextEvaluationDate ? new Date(nextEvaluationDate) : null,
      notes: notes || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.insert(vendor_kpi_evaluations)
      .values(newEvaluation)
      .returning();

    // Update vendor's overall rating
    await db.update(vendors)
      .set({ 
        overallRating: rating,
        updatedAt: new Date()
      })
      .where(eq(vendors.id, vendorId));

    res.status(201).json({
      message: 'KPI evaluation created successfully',
      evaluation: result[0]
    });

  } catch (error) {
    console.error('Create KPI evaluation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update KPI evaluation
router.put('/evaluations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if evaluation exists
    const existingEvaluation = await db.select()
      .from(vendor_kpi_evaluations)
      .where(eq(vendor_kpi_evaluations.id, id))
      .limit(1);

    if (existingEvaluation.length === 0) {
      return res.status(404).json({ error: 'KPI evaluation not found' });
    }

    // Prepare update data
    const evaluationUpdate = {
      ...updateData,
      updatedAt: new Date()
    };

    // Remove fields that shouldn't be updated directly
    delete evaluationUpdate.id;
    delete evaluationUpdate.vendorId;
    delete evaluationUpdate.evaluatorId;
    delete evaluationUpdate.createdAt;

    // Validate scores if provided
    const scoreFields = ['qualityScore', 'timelinessScore', 'costScore', 'communicationScore', 'technicalScore'];
    for (const field of scoreFields) {
      if (evaluationUpdate[field] !== undefined) {
        const score = parseFloat(evaluationUpdate[field]);
        if (score < 1 || score > 10) {
          return res.status(400).json({ 
            error: 'All scores must be between 1 and 10' 
          });
        }
        evaluationUpdate[field] = score;
      }
    }

    // Recalculate overall score and rating if scores changed
    const scoresChanged = scoreFields.some(field => evaluationUpdate[field] !== undefined);
    if (scoresChanged) {
      const scores = [
        evaluationUpdate.qualityScore || existingEvaluation[0].qualityScore,
        evaluationUpdate.timelinessScore || existingEvaluation[0].timelinessScore,
        evaluationUpdate.costScore || existingEvaluation[0].costScore,
        evaluationUpdate.communicationScore || existingEvaluation[0].communicationScore,
        evaluationUpdate.technicalScore || existingEvaluation[0].technicalScore
      ].filter(s => s !== null);

      const overallScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      
      let rating;
      if (overallScore >= 9) rating = 'excellent';
      else if (overallScore >= 8) rating = 'good';
      else if (overallScore >= 6) rating = 'satisfactory';
      else if (overallScore >= 4) rating = 'needs_improvement';
      else rating = 'poor';

      evaluationUpdate.overallScore = parseFloat(overallScore.toFixed(1));
      evaluationUpdate.rating = rating;

      // Update vendor's overall rating
      await db.update(vendors)
        .set({ 
          overallRating: rating,
          updatedAt: new Date()
        })
        .where(eq(vendors.id, existingEvaluation[0].vendorId));
    }

    // Convert date fields
    if (evaluationUpdate.nextEvaluationDate) {
      evaluationUpdate.nextEvaluationDate = new Date(evaluationUpdate.nextEvaluationDate);
    }

    const result = await db.update(vendor_kpi_evaluations)
      .set(evaluationUpdate)
      .where(eq(vendor_kpi_evaluations.id, id))
      .returning();

    res.json({
      message: 'KPI evaluation updated successfully',
      evaluation: result[0]
    });

  } catch (error) {
    console.error('Update KPI evaluation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete KPI evaluation
router.delete('/evaluations/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if evaluation exists
    const existingEvaluation = await db.select()
      .from(vendor_kpi_evaluations)
      .where(eq(vendor_kpi_evaluations.id, id))
      .limit(1);

    if (existingEvaluation.length === 0) {
      return res.status(404).json({ error: 'KPI evaluation not found' });
    }

    await db.delete(vendor_kpi_evaluations)
      .where(eq(vendor_kpi_evaluations.id, id));

    res.json({ message: 'KPI evaluation deleted successfully' });

  } catch (error) {
    console.error('Delete KPI evaluation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get KPI criteria
router.get('/criteria', async (req, res) => {
  try {
    const { 
      category,
      isActive = true
    } = req.query;

    let whereConditions = [];
    
    if (category) {
      whereConditions.push(eq(vendor_kpi_criteria.category, category));
    }

    if (isActive !== undefined) {
      whereConditions.push(eq(vendor_kpi_criteria.isActive, isActive === 'true'));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const criteria = await db.select()
      .from(vendor_kpi_criteria)
      .where(whereClause)
      .orderBy(asc(vendor_kpi_criteria.name));

    res.json({ criteria });

  } catch (error) {
    console.error('Get KPI criteria error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create KPI criterion
router.post('/criteria', async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      weight = 1.0,
      measurementUnit,
      targetValue,
      minValue,
      maxValue
    } = req.body;

    // Validate required fields
    if (!name || !category || !description) {
      return res.status(400).json({ 
        error: 'Name, category, and description are required' 
      });
    }

    const newCriterion = {
      id: `kpi_criteria_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      category,
      description,
      weight: parseFloat(weight),
      measurementUnit: measurementUnit || null,
      targetValue: targetValue ? parseFloat(targetValue) : null,
      minValue: minValue ? parseFloat(minValue) : null,
      maxValue: maxValue ? parseFloat(maxValue) : null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.insert(vendor_kpi_criteria)
      .values(newCriterion)
      .returning();

    res.status(201).json({
      message: 'KPI criterion created successfully',
      criterion: result[0]
    });

  } catch (error) {
    console.error('Create KPI criterion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get vendor evaluation history
router.get('/evaluations/vendor/:vendorId/history', async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { limit = 10 } = req.query;

    const evaluations = await db.select({
      id: vendor_kpi_evaluations.id,
      evaluationPeriod: vendor_kpi_evaluations.evaluationPeriod,
      overallScore: vendor_kpi_evaluations.overallScore,
      rating: vendor_kpi_evaluations.rating,
      evaluatorName: users.name,
      createdAt: vendor_kpi_evaluations.createdAt
    })
    .from(vendor_kpi_evaluations)
    .leftJoin(users, eq(vendor_kpi_evaluations.evaluatorId, users.id))
    .where(eq(vendor_kpi_evaluations.vendorId, vendorId))
    .orderBy(desc(vendor_kpi_evaluations.createdAt))
    .limit(parseInt(limit));

    res.json({ evaluations });

  } catch (error) {
    console.error('Get vendor evaluation history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get KPI statistics
router.get('/stats/overview', async (req, res) => {
  try {
    // Evaluations by rating
    const evaluationsByRating = await db.select({
      rating: vendor_kpi_evaluations.rating,
      count: vendor_kpi_evaluations.id
    })
    .from(vendor_kpi_evaluations)
    .groupBy(vendor_kpi_evaluations.rating);

    // Average scores by category
    const avgScoresByCategory = await db.select({
      category: vendors.category,
      avgQuality: vendor_kpi_evaluations.qualityScore,
      avgTimeliness: vendor_kpi_evaluations.timelinessScore,
      avgCost: vendor_kpi_evaluations.costScore,
      avgCommunication: vendor_kpi_evaluations.communicationScore,
      avgTechnical: vendor_kpi_evaluations.technicalScore,
      avgOverall: vendor_kpi_evaluations.overallScore,
      evaluationCount: vendor_kpi_evaluations.id
    })
    .from(vendor_kpi_evaluations)
    .leftJoin(vendors, eq(vendor_kpi_evaluations.vendorId, vendors.id))
    .groupBy(vendors.category);

    // Top performing vendors
    const topVendors = await db.select({
      vendorId: vendor_kpi_evaluations.vendorId,
      vendorName: vendors.name,
      vendorCategory: vendors.category,
      avgScore: vendor_kpi_evaluations.overallScore,
      evaluationCount: vendor_kpi_evaluations.id
    })
    .from(vendor_kpi_evaluations)
    .leftJoin(vendors, eq(vendor_kpi_evaluations.vendorId, vendors.id))
    .groupBy(vendor_kpi_evaluations.vendorId, vendors.name, vendors.category)
    .orderBy(desc(vendor_kpi_evaluations.overallScore))
    .limit(10);

    // Recent evaluations
    const recentEvaluations = await db.select({
      id: vendor_kpi_evaluations.id,
      evaluationPeriod: vendor_kpi_evaluations.evaluationPeriod,
      overallScore: vendor_kpi_evaluations.overallScore,
      rating: vendor_kpi_evaluations.rating,
      vendorName: vendors.name,
      evaluatorName: users.name,
      createdAt: vendor_kpi_evaluations.createdAt
    })
    .from(vendor_kpi_evaluations)
    .leftJoin(vendors, eq(vendor_kpi_evaluations.vendorId, vendors.id))
    .leftJoin(users, eq(vendor_kpi_evaluations.evaluatorId, users.id))
    .orderBy(desc(vendor_kpi_evaluations.createdAt))
    .limit(10);

    res.json({
      evaluationsByRating,
      avgScoresByCategory,
      topVendors,
      recentEvaluations
    });

  } catch (error) {
    console.error('Get KPI stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
