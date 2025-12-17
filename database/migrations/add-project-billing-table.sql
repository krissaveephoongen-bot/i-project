-- Project Billing & Invoicing System
-- Manages billing phases, milestones, deliverables, and payment tracking
-- Created: 2025-12-15

-- Create billing phase status enum
CREATE TYPE billing_phase_status AS ENUM ('pending', 'in-progress', 'delivered', 'invoiced', 'paid', 'overdue', 'cancelled');

-- First ensure the projects table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'projects') THEN
        RAISE EXCEPTION 'Projects table does not exist. Please run the projects table migration first.';
    END IF;
END $$;

-- Project Billing Phases table
CREATE TABLE IF NOT EXISTS project_billing_phases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    object_id TEXT UNIQUE,
    
    -- Foreign Key (will be added after table creation if needed)
    project_id UUID NOT NULL,
    
    -- Phase Information
    phase_number INTEGER NOT NULL,
    description TEXT NOT NULL,
    
    -- Financial
    amount DECIMAL(15,2) NOT NULL,
    percentage_of_total DECIMAL(5,2), -- Auto-calculated
    currency TEXT DEFAULT 'THB',
    
    -- Delivery Schedule
    planned_delivery_date TIMESTAMP WITH TIME ZONE,
    actual_delivery_date TIMESTAMP WITH TIME ZONE,
    
    -- Payment Schedule
    planned_payment_date TIMESTAMP WITH TIME ZONE,
    actual_payment_date TIMESTAMP WITH TIME ZONE,
    
    -- Status and Notes
    status billing_phase_status DEFAULT 'pending',
    deliverables TEXT, -- JSON or comma-separated list
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT,
    updated_by TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    
    CONSTRAINT chk_phase_number CHECK (phase_number > 0),
    CONSTRAINT chk_amount CHECK (amount >= 0),
    CONSTRAINT chk_percentage CHECK (percentage_of_total >= 0 AND percentage_of_total <= 100),
    CONSTRAINT chk_delivery_dates CHECK (actual_delivery_date IS NULL OR actual_delivery_date >= planned_delivery_date),
    CONSTRAINT chk_payment_dates CHECK (actual_payment_date IS NULL OR actual_payment_date >= planned_payment_date)
);

-- Project Invoice Details table
CREATE TABLE IF NOT EXISTS project_invoices_detailed (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    object_id TEXT UNIQUE,
    
    -- Foreign Keys
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    billing_phase_id UUID NOT NULL REFERENCES project_billing_phases(id) ON DELETE CASCADE,
    
    -- Invoice Information
    invoice_number TEXT UNIQUE NOT NULL,
    invoice_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Amount
    subtotal DECIMAL(15,2) NOT NULL,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    
    -- Payment Tracking
    due_date TIMESTAMP WITH TIME ZONE,
    paid_date TIMESTAMP WITH TIME ZONE,
    amount_paid DECIMAL(15,2) DEFAULT 0,
    balance_due DECIMAL(15,2) NOT NULL,
    
    -- Status
    status billing_phase_status DEFAULT 'pending',
    payment_method TEXT,
    transaction_reference TEXT,
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT,
    updated_by TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    
    CONSTRAINT chk_invoice_amounts CHECK (subtotal >= 0 AND total_amount >= 0 AND amount_paid >= 0)
);

-- Billing Summary View
CREATE VIEW project_billing_summary AS
SELECT 
    p.id AS project_id,
    p.code AS project_code,
    p.name AS project_name,
    p.contract_amount AS total_contract_value,
    COUNT(DISTINCT pbp.id) AS total_phases,
    SUM(pbp.amount) AS total_billing_amount,
    SUM(CASE WHEN pbp.status = 'pending' THEN pbp.amount ELSE 0 END) AS pending_amount,
    SUM(CASE WHEN pbp.status IN ('invoiced', 'paid') THEN pbp.amount ELSE 0 END) AS invoiced_amount,
    SUM(CASE WHEN pbp.status = 'paid' THEN pbp.amount ELSE 0 END) AS paid_amount,
    SUM(CASE WHEN pbp.status = 'overdue' THEN pbp.amount ELSE 0 END) AS overdue_amount,
    COUNT(CASE WHEN pbp.status = 'delivered' THEN 1 END) AS delivered_phases,
    COUNT(CASE WHEN pbp.status = 'paid' THEN 1 END) AS paid_phases,
    SUM(pii.amount_paid) AS total_paid,
    SUM(pii.balance_due) AS total_balance_due
FROM projects p
LEFT JOIN project_billing_phases pbp ON p.id = pbp.project_id AND pbp.is_deleted = FALSE
LEFT JOIN project_invoices_detailed pii ON pbp.id = pii.billing_phase_id AND pii.is_deleted = FALSE
WHERE p.is_deleted = FALSE
GROUP BY p.id, p.code, p.name, p.contract_amount;

-- Overdue Invoices View
CREATE VIEW overdue_invoices AS
SELECT 
    pii.*,
    pbp.phase_number,
    pbp.description,
    p.name AS project_name,
    p.code AS project_code,
    EXTRACT(DAY FROM (NOW() - pii.due_date)) AS days_overdue
FROM project_invoices_detailed pii
JOIN project_billing_phases pbp ON pii.billing_phase_id = pbp.id
JOIN projects p ON pii.project_id = p.id
WHERE pii.due_date < NOW() 
    AND pii.status != 'paid'
    AND pii.is_deleted = FALSE
    AND pbp.is_deleted = FALSE
    AND p.is_deleted = FALSE
ORDER BY pii.due_date ASC;

-- Create indexes for better performance
CREATE INDEX idx_billing_phases_project_id ON project_billing_phases(project_id);
CREATE INDEX idx_billing_phases_phase_number ON project_billing_phases(project_id, phase_number);
CREATE INDEX idx_billing_phases_status ON project_billing_phases(status);
CREATE INDEX idx_billing_phases_delivery_date ON project_billing_phases(planned_delivery_date, actual_delivery_date);
CREATE INDEX idx_billing_phases_payment_date ON project_billing_phases(planned_payment_date, actual_payment_date);

CREATE INDEX idx_invoices_project_id ON project_invoices_detailed(project_id);
CREATE INDEX idx_invoices_billing_phase_id ON project_invoices_detailed(billing_phase_id);
CREATE INDEX idx_invoices_invoice_number ON project_invoices_detailed(invoice_number);
CREATE INDEX idx_invoices_status ON project_invoices_detailed(status);
CREATE INDEX idx_invoices_due_date ON project_invoices_detailed(due_date);
CREATE INDEX idx_invoices_paid_date ON project_invoices_detailed(paid_date);

-- Create triggers
CREATE TRIGGER update_project_billing_phases_updated_at 
BEFORE UPDATE ON project_billing_phases 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_invoices_detailed_updated_at 
BEFORE UPDATE ON project_invoices_detailed 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Sample data
CREATE OR REPLACE FUNCTION insert_sample_billing_data()
RETURNS void AS $$
DECLARE
    project_id UUID;
    phase_id UUID;
    contract_amount DECIMAL;
BEGIN
    -- Get first active project
    SELECT id, contract_amount INTO project_id, contract_amount 
    FROM projects WHERE status = 'active' LIMIT 1;
    
    IF project_id IS NOT NULL THEN
        -- Phase 1: Design & Planning (25%)
        INSERT INTO project_billing_phases (
            project_id, phase_number, description, amount, percentage_of_total,
            planned_delivery_date, planned_payment_date, status
        ) VALUES (
            project_id, 1, 'System Design & Planning', contract_amount * 0.25, 25,
            NOW() + INTERVAL '30 days', NOW() + INTERVAL '35 days', 'delivered'
        )
        RETURNING id INTO phase_id;
        
        -- Create invoice for phase 1
        INSERT INTO project_invoices_detailed (
            project_id, billing_phase_id, invoice_number, subtotal, total_amount,
            amount_paid, balance_due, status, paid_date, due_date
        ) VALUES (
            project_id, phase_id, 'INV-001', contract_amount * 0.25, contract_amount * 0.25,
            contract_amount * 0.25, 0, 'paid', NOW(), NOW()
        );
        
        -- Phase 2: Development (45%)
        INSERT INTO project_billing_phases (
            project_id, phase_number, description, amount, percentage_of_total,
            planned_delivery_date, planned_payment_date, status
        ) VALUES (
            project_id, 2, 'Development & Implementation', contract_amount * 0.45, 45,
            NOW() + INTERVAL '90 days', NOW() + INTERVAL '95 days', 'in-progress'
        )
        RETURNING id INTO phase_id;
        
        -- Phase 3: Testing & QA (15%)
        INSERT INTO project_billing_phases (
            project_id, phase_number, description, amount, percentage_of_total,
            planned_delivery_date, planned_payment_date, status
        ) VALUES (
            project_id, 3, 'Testing, QA & Deployment', contract_amount * 0.15, 15,
            NOW() + INTERVAL '120 days', NOW() + INTERVAL '125 days', 'pending'
        )
        RETURNING id INTO phase_id;
        
        -- Phase 4: Support & Maintenance (15%)
        INSERT INTO project_billing_phases (
            project_id, phase_number, description, amount, percentage_of_total,
            planned_delivery_date, planned_payment_date, status
        ) VALUES (
            project_id, 4, 'Support & Maintenance', contract_amount * 0.15, 15,
            NOW() + INTERVAL '150 days', NOW() + INTERVAL '155 days', 'pending'
        );
    END IF;
END;
$$ LANGUAGE plpgsql;
