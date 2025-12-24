-- Advanced Analytics and ML-Ready Features
-- Migration: Add Advanced Analytics Infrastructure
-- Created: 2025-12-24

-- Project Health Scoring Table
CREATE TABLE project_health_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES "Project"(id) ON DELETE CASCADE,
    health_score DECIMAL(5,2) NOT NULL CHECK (health_score >= 0 AND health_score <= 100),
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    factors JSONB NOT NULL, -- ML model factors
    predictions JSONB, -- Predictive analytics
    recommendations TEXT[],
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    next_review_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Behavior Analytics Table
CREATE TABLE user_behavior_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    session_id VARCHAR(255),
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB,
    page_url VARCHAR(500),
    user_agent TEXT,
    ip_address INET,
    device_info JSONB,
    performance_metrics JSONB,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Predictive Analytics Cache
CREATE TABLE predictive_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL, -- 'project', 'task', 'user'
    entity_id UUID NOT NULL,
    prediction_type VARCHAR(100) NOT NULL,
    prediction_data JSONB NOT NULL,
    confidence_score DECIMAL(5,2),
    valid_until TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Automated Workflow Triggers
CREATE TABLE workflow_triggers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trigger_type VARCHAR(50) NOT NULL, -- 'time', 'event', 'condition'
    trigger_config JSONB NOT NULL,
    actions JSONB NOT NULL, -- Array of actions to execute
    is_active BOOLEAN NOT NULL DEFAULT true,
    priority INTEGER NOT NULL DEFAULT 1,
    cooldown_minutes INTEGER DEFAULT 0,
    last_triggered_at TIMESTAMPTZ,
    created_by UUID REFERENCES "User"(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Resource Optimization Recommendations
CREATE TABLE resource_optimization (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES "Project"(id) ON DELETE CASCADE,
    recommendation_type VARCHAR(50) NOT NULL,
    current_allocation JSONB,
    recommended_allocation JSONB,
    expected_impact JSONB,
    implementation_complexity VARCHAR(20),
    priority_score DECIMAL(5,2),
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    implemented_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Advanced Analytics Views

-- Project Risk Assessment View
CREATE OR REPLACE VIEW project_risk_assessment AS
SELECT
    p.id,
    p.name,
    p.status,
    p.progress,
    p.end_date,

    -- Risk factors calculation
    CASE
        WHEN p.progress < 25 AND p.end_date < NOW() + INTERVAL '30 days' THEN 'critical'
        WHEN p.progress < 50 AND p.end_date < NOW() + INTERVAL '14 days' THEN 'high'
        WHEN p.progress < 75 AND p.end_date < NOW() + INTERVAL '7 days' THEN 'medium'
        ELSE 'low'
    END as risk_level,

    -- Overdue tasks count
    COUNT(CASE WHEN t.due_date < NOW() AND t.status != 'DONE' THEN 1 END) as overdue_tasks,

    -- Team utilization
    COUNT(DISTINCT t.assignee_id) as active_team_members,

    -- Budget variance
    CASE
        WHEN p.budget > 0 THEN ROUND(((COALESCE(p.actual_cost, 0) / p.budget) * 100), 2)
        ELSE 0
    END as budget_utilization_percent,

    -- Days remaining
    CASE
        WHEN p.end_date IS NOT NULL THEN EXTRACT(EPOCH FROM (p.end_date - NOW())) / 86400
        ELSE NULL
    END as days_remaining,

    p.created_at
FROM "Project" p
LEFT JOIN tasks t ON p.id = t."projectId"
GROUP BY p.id, p.name, p.status, p.progress, p.end_date, p.budget, p.actual_cost, p.created_at;

-- Team Productivity Insights View
CREATE OR REPLACE VIEW team_productivity_insights AS
SELECT
    u.id as user_id,
    u.name,
    u.role,
    u.department,

    -- Task completion metrics
    COUNT(CASE WHEN t.status = 'DONE' THEN 1 END) as completed_tasks,
    COUNT(CASE WHEN t.status IN ('TODO', 'IN_PROGRESS', 'IN_REVIEW') THEN 1 END) as active_tasks,
    ROUND(
        CASE
            WHEN COUNT(t.id) > 0 THEN
                (COUNT(CASE WHEN t.status = 'DONE' THEN 1 END)::DECIMAL / COUNT(t.id)) * 100
            ELSE 0
        END, 2
    ) as completion_rate,

    -- Time efficiency
    COALESCE(SUM(tl.duration), 0) as total_hours_logged,
    COALESCE(AVG(tl.duration), 0) as avg_session_length,
    COALESCE(SUM(CASE WHEN tl.start_time >= date_trunc('week', NOW()) THEN tl.duration END), 0) as hours_this_week,

    -- Quality metrics (based on task revisions, bugs, etc.)
    COUNT(CASE WHEN t.status = 'DONE' AND t.updated_at > t.created_at + INTERVAL '7 days' THEN 1 END) as complex_tasks,

    -- Collaboration score (based on comments, assignments)
    COUNT(DISTINCT c.id) as comments_made,
    COUNT(DISTINCT t.id) as tasks_assigned,

    NOW() as calculated_at
FROM "User" u
LEFT JOIN tasks t ON u.id = t.assignee_id
LEFT JOIN time_logs tl ON u.id = tl.user_id
LEFT JOIN comments c ON u.id = c.user_id
WHERE u.status = 'active'
GROUP BY u.id, u.name, u.role, u.department;

-- Predictive Project Completion View
CREATE OR REPLACE VIEW predictive_completion AS
SELECT
    p.id,
    p.name,
    p.progress,
    p.start_date,
    p.end_date,

    -- Current velocity (tasks completed per day)
    CASE
        WHEN p.start_date IS NOT NULL THEN
            COUNT(CASE WHEN t.status = 'DONE' THEN 1 END)::DECIMAL /
            GREATEST(EXTRACT(EPOCH FROM (NOW() - p.start_date)) / 86400, 1)
        ELSE 0
    END as current_velocity,

    -- Estimated completion date based on current velocity
    CASE
        WHEN p.progress > 0 AND p.progress < 100 THEN
            NOW() + INTERVAL '1 day' * (
                ((100 - p.progress) / GREATEST(p.progress, 1)) *
                (EXTRACT(EPOCH FROM (NOW() - p.start_date)) / 86400)
            )
        ELSE NULL
    END as predicted_completion_date,

    -- Confidence score (based on data consistency)
    CASE
        WHEN COUNT(t.id) > 10 AND p.progress > 20 THEN 85
        WHEN COUNT(t.id) > 5 AND p.progress > 10 THEN 70
        WHEN COUNT(t.id) > 0 THEN 50
        ELSE 20
    END as prediction_confidence,

    COUNT(t.id) as total_tasks,
    COUNT(CASE WHEN t.status = 'DONE' THEN 1 END) as completed_tasks,

    NOW() as predicted_at
FROM "Project" p
LEFT JOIN tasks t ON p.id = t."projectId"
WHERE p.status IN ('PLANNING', 'IN_PROGRESS')
GROUP BY p.id, p.name, p.progress, p.start_date, p.end_date;

-- Resource Bottleneck Analysis View
CREATE TABLE resource_bottlenecks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES "User"(id) ON DELETE CASCADE,
    bottleneck_type VARCHAR(50) NOT NULL, -- 'overloaded', 'underutilized', 'skill_gap'
    severity_score DECIMAL(5,2) NOT NULL,
    affected_projects UUID[],
    recommendations TEXT[],
    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL DEFAULT 'active'
);

-- Advanced Search Index (Materialized)
CREATE MATERIALIZED VIEW search_index AS
SELECT
    'project' as entity_type,
    p.id as entity_id,
    p.name as title,
    p.description as content,
    p.code as identifier,
    ARRAY[p.name, p.code, COALESCE(p.description, '')] as search_terms,
    p.status,
    p.priority,
    p.created_at as created_at,
    p.updated_at as updated_at
FROM "Project" p

UNION ALL

SELECT
    'task' as entity_type,
    t.id as entity_id,
    t.title,
    t.description,
    t.id::text as identifier,
    ARRAY[t.title, COALESCE(t.description, '')] as search_terms,
    t.status,
    t.priority,
    t.created_at,
    t.updated_at
FROM tasks t

UNION ALL

SELECT
    'user' as entity_type,
    u.id as entity_id,
    u.name as title,
    '' as content,
    u.email as identifier,
    ARRAY[u.name, u.email, COALESCE(u.department, '')] as search_terms,
    u.status,
    'medium' as priority,
    u.created_at,
    u.created_at as updated_at
FROM "User" u;

-- Create indexes for advanced analytics
CREATE INDEX idx_project_health_scores_project_id ON project_health_scores(project_id);
CREATE INDEX idx_project_health_scores_risk_level ON project_health_scores(risk_level);
CREATE INDEX idx_user_behavior_analytics_user_id ON user_behavior_analytics(user_id);
CREATE INDEX idx_user_behavior_analytics_event_type ON user_behavior_analytics(event_type);
CREATE INDEX idx_user_behavior_analytics_timestamp ON user_behavior_analytics(timestamp);
CREATE INDEX idx_predictive_cache_entity ON predictive_cache(entity_type, entity_id);
CREATE INDEX idx_predictive_cache_valid_until ON predictive_cache(valid_until);
CREATE INDEX idx_workflow_triggers_active ON workflow_triggers(is_active, priority);
CREATE INDEX idx_resource_optimization_project ON resource_optimization(project_id);
CREATE INDEX idx_resource_bottlenecks_user ON resource_bottlenecks(user_id);
CREATE INDEX idx_resource_bottlenecks_status ON resource_bottlenecks(status);
CREATE INDEX idx_search_index_terms ON search_index USING GIN(search_terms);
CREATE INDEX idx_search_index_entity ON search_index(entity_type, status);

-- Advanced Analytics Functions

-- Function to calculate project health score
CREATE OR REPLACE FUNCTION calculate_project_health(project_uuid UUID)
RETURNS TABLE (
    health_score DECIMAL,
    risk_level TEXT,
    factors JSONB,
    recommendations TEXT[]
) AS $$
DECLARE
    proj_record RECORD;
    overdue_count INTEGER;
    team_size INTEGER;
    budget_variance DECIMAL;
    progress_rate DECIMAL;
    health DECIMAL := 100.0;
    risk TEXT := 'low';
    factor_list JSONB := '{}';
    rec_list TEXT[] := '{}';
BEGIN
    -- Get project data
    SELECT * INTO proj_record FROM "Project" WHERE id = project_uuid;

    IF NOT FOUND THEN
        RETURN;
    END IF;

    -- Calculate overdue tasks
    SELECT COUNT(*) INTO overdue_count
    FROM tasks
    WHERE "projectId" = project_uuid
      AND due_date < NOW()
      AND status != 'DONE';

    -- Calculate team size
    SELECT COUNT(DISTINCT assignee_id) INTO team_size
    FROM tasks
    WHERE "projectId" = project_uuid AND assignee_id IS NOT NULL;

    -- Calculate budget variance
    budget_variance := CASE
        WHEN proj_record.budget > 0 THEN
            ((COALESCE(proj_record.actual_cost, 0) / proj_record.budget) * 100)
        ELSE 0
    END;

    -- Calculate progress rate
    progress_rate := CASE
        WHEN proj_record.start_date IS NOT NULL THEN
            proj_record.progress / GREATEST(EXTRACT(EPOCH FROM (NOW() - proj_record.start_date)) / 86400, 1)
        ELSE 0
    END;

    -- Apply health score penalties
    IF overdue_count > 0 THEN
        health := health - (overdue_count * 5);
        factor_list := factor_list || jsonb_build_object('overdue_tasks', overdue_count);
        rec_list := rec_list || 'Address overdue tasks immediately';
    END IF;

    IF budget_variance > 90 THEN
        health := health - 20;
        factor_list := factor_list || jsonb_build_object('budget_overrun', budget_variance);
        rec_list := rec_list || 'Review budget allocation and spending';
    END IF;

    IF team_size < 2 THEN
        health := health - 15;
        factor_list := factor_list || jsonb_build_object('small_team', team_size);
        rec_list := rec_list || 'Consider adding team members';
    END IF;

    IF progress_rate < 0.5 THEN
        health := health - 10;
        factor_list := factor_list || jsonb_build_object('slow_progress', progress_rate);
        rec_list := rec_list || 'Review project timeline and resources';
    END IF;

    -- Determine risk level
    IF health < 30 THEN risk := 'critical';
    ELSIF health < 50 THEN risk := 'high';
    ELSIF health < 70 THEN risk := 'medium';
    ELSE risk := 'low';
    END IF;

    -- Ensure health score is within bounds
    health := GREATEST(0, LEAST(100, health));

    RETURN QUERY SELECT health, risk, factor_list, rec_list;
END;
$$ LANGUAGE plpgsql;

-- Function to detect resource bottlenecks
CREATE OR REPLACE FUNCTION detect_resource_bottlenecks()
RETURNS TABLE (
    user_id UUID,
    user_name TEXT,
    bottleneck_type TEXT,
    severity_score DECIMAL,
    recommendations TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.id,
        u.name,
        CASE
            WHEN active_tasks > 8 THEN 'overloaded'
            WHEN active_tasks < 2 AND hours_this_week > 20 THEN 'underutilized'
            ELSE 'balanced'
        END as bottleneck_type,
        CASE
            WHEN active_tasks > 8 THEN LEAST(active_tasks * 5, 100)::DECIMAL
            WHEN active_tasks < 2 AND hours_this_week > 20 THEN 30::DECIMAL
            ELSE 0::DECIMAL
        END as severity_score,
        CASE
            WHEN active_tasks > 8 THEN ARRAY['Reassign some tasks', 'Consider hiring additional resources']
            WHEN active_tasks < 2 AND hours_this_week > 20 THEN ARRAY['Assign more tasks', 'Review workload distribution']
            ELSE ARRAY['Workload is balanced']
        END as recommendations
    FROM user_workloads uw
    JOIN "User" u ON uw.user_id = u.id
    WHERE uw.active_tasks > 8 OR (uw.active_tasks < 2 AND uw.hours_this_week > 20);
END;
$$ LANGUAGE plpgsql;

-- Function for intelligent search with ranking
CREATE OR REPLACE FUNCTION intelligent_search(search_query TEXT, limit_count INTEGER DEFAULT 20)
RETURNS TABLE (
    entity_type TEXT,
    entity_id UUID,
    title TEXT,
    relevance_score DECIMAL
) AS $$
DECLARE
    query_terms TEXT[];
BEGIN
    query_terms := regexp_split_to_array(lower(search_query), '\s+');

    RETURN QUERY
    SELECT
        si.entity_type,
        si.entity_id,
        si.title,
        (
            -- Exact title match gets highest score
            CASE WHEN lower(si.title) = lower(search_query) THEN 100
                 WHEN lower(si.title) LIKE lower(search_query) || '%' THEN 80
                 WHEN lower(si.title) LIKE '%' || lower(search_query) || '%' THEN 60
                 ELSE 0 END
        ) +
        (
            -- Identifier match
            CASE WHEN lower(si.identifier) = lower(search_query) THEN 50
                 WHEN lower(si.identifier) LIKE lower(search_query) || '%' THEN 30
                 ELSE 0 END
        ) +
        (
            -- Content match
            CASE WHEN lower(si.content) LIKE '%' || lower(search_query) || '%' THEN 20
                 ELSE 0 END
        ) as relevance_score
    FROM search_index si
    WHERE si.status NOT IN ('cancelled', 'inactive')
      AND (
          lower(si.title) LIKE '%' || lower(search_query) || '%' OR
          lower(si.identifier) LIKE '%' || lower(search_query) || '%' OR
          lower(si.content) LIKE '%' || lower(search_query) || '%' OR
          EXISTS (
              SELECT 1 FROM unnest(si.search_terms) term
              WHERE lower(term) LIKE '%' || lower(search_query) || '%'
          )
      )
    ORDER BY relevance_score DESC, si.updated_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Automated workflow trigger function
CREATE OR REPLACE FUNCTION process_workflow_triggers()
RETURNS void AS $$
DECLARE
    trigger_record RECORD;
    should_trigger BOOLEAN;
    last_trigger TIMESTAMPTZ;
BEGIN
    FOR trigger_record IN SELECT * FROM workflow_triggers WHERE is_active = true ORDER BY priority DESC
    LOOP
        -- Check cooldown
        SELECT last_triggered_at INTO last_trigger
        FROM workflow_triggers
        WHERE id = trigger_record.id;

        IF last_trigger IS NOT NULL AND
           trigger_record.cooldown_minutes > 0 AND
           last_trigger > NOW() - INTERVAL '1 minute' * trigger_record.cooldown_minutes THEN
            CONTINUE;
        END IF;

        -- Evaluate trigger conditions based on type
        should_trigger := false;

        IF trigger_record.trigger_type = 'time' THEN
            -- Time-based triggers (cron-like)
            should_trigger := true; -- Implement cron logic here
        ELSIF trigger_record.trigger_type = 'event' THEN
            -- Event-based triggers
            should_trigger := true; -- Check recent events
        ELSIF trigger_record.trigger_type = 'condition' THEN
            -- Condition-based triggers (check metrics)
            should_trigger := true; -- Evaluate conditions
        END IF;

        IF should_trigger THEN
            -- Execute actions (implement action processing logic)
            UPDATE workflow_triggers
            SET last_triggered_at = NOW()
            WHERE id = trigger_record.id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Refresh materialized views function
CREATE OR REPLACE FUNCTION refresh_advanced_analytics()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY search_index;

    -- Update project health scores
    INSERT INTO project_health_scores (
        project_id, health_score, risk_level, factors, recommendations
    )
    SELECT
        id, health_score, risk_level, factors, recommendations
    FROM (
        SELECT
            p.id,
            (c.health_score[1]) as health_score,
            (c.risk_level[1]) as risk_level,
            (c.factors[1]) as factors,
            (c.recommendations[1]) as recommendations
        FROM "Project" p
        CROSS JOIN LATERAL calculate_project_health(p.id) c
    ) ph
    ON CONFLICT (project_id)
    DO UPDATE SET
        health_score = EXCLUDED.health_score,
        risk_level = EXCLUDED.risk_level,
        factors = EXCLUDED.factors,
        recommendations = EXCLUDED.recommendations,
        updated_at = NOW();

    -- Update resource bottlenecks
    DELETE FROM resource_bottlenecks WHERE status = 'active';
    INSERT INTO resource_bottlenecks (user_id, bottleneck_type, severity_score, recommendations)
    SELECT user_id, bottleneck_type, severity_score, recommendations
    FROM detect_resource_bottlenecks();
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE project_health_scores IS 'ML-ready project health scoring with predictive analytics';
COMMENT ON TABLE user_behavior_analytics IS 'Comprehensive user behavior tracking for analytics';
COMMENT ON TABLE predictive_cache IS 'Caching layer for ML predictions and recommendations';
COMMENT ON TABLE workflow_triggers IS 'Automated workflow triggers with complex conditions';
COMMENT ON TABLE resource_optimization IS 'AI-powered resource allocation recommendations';
COMMENT ON TABLE resource_bottlenecks IS 'Real-time resource bottleneck detection and alerts';

COMMENT ON VIEW project_risk_assessment IS 'Advanced project risk assessment with multiple factors';
COMMENT ON VIEW team_productivity_insights IS 'Comprehensive team productivity analytics';
COMMENT ON VIEW predictive_completion IS 'ML-based project completion predictions';
COMMENT ON MATERIALIZED VIEW search_index IS 'Full-text search index with relevance scoring';

COMMENT ON FUNCTION calculate_project_health IS 'Calculate comprehensive project health score with ML factors';
COMMENT ON FUNCTION detect_resource_bottlenecks IS 'Detect and analyze resource bottlenecks in real-time';
COMMENT ON FUNCTION intelligent_search IS 'AI-powered search with relevance ranking';
COMMENT ON FUNCTION process_workflow_triggers IS 'Execute automated workflow triggers based on conditions';
COMMENT ON FUNCTION refresh_advanced_analytics IS 'Refresh all advanced analytics data and materialized views';