-- ============================================================
-- AI eDiscovery System - PostgreSQL Database Schema
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. USERS
-- ============================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'attorney', 'reviewer', 'paralegal')),
    firm_name VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    reset_token VARCHAR(255),
    reset_token_expiry TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Add password reset cols if upgrading
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP;

CREATE TABLE ai_results (
    id BIGSERIAL PRIMARY KEY,
    feature VARCHAR(100) NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    input JSONB NOT NULL,
    output JSONB NOT NULL,
    model VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_ai_results_feature_created ON ai_results(feature, created_at DESC);

-- ============================================================
-- 2. CASES
-- ============================================================
CREATE TABLE cases (
    id SERIAL PRIMARY KEY,
    case_name VARCHAR(500) NOT NULL,
    case_number VARCHAR(100) UNIQUE NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    matter_type VARCHAR(50) NOT NULL CHECK (matter_type IN ('litigation', 'investigation', 'regulatory', 'compliance')),
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'closed', 'archived')),
    description TEXT,
    lead_attorney VARCHAR(255),
    date_filed DATE,
    court_jurisdiction VARCHAR(255),
    opposing_counsel VARCHAR(255),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 3. DOCUMENTS
-- ============================================================
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    file_type VARCHAR(20) NOT NULL CHECK (file_type IN ('pdf', 'docx', 'xlsx', 'eml', 'pptx', 'txt', 'csv', 'html')),
    file_size_mb DECIMAL(10, 2),
    custodian VARCHAR(255),
    source VARCHAR(255),
    review_status VARCHAR(50) DEFAULT 'pending' CHECK (review_status IN ('pending', 'relevant', 'not_relevant', 'privileged', 'hot')),
    content_preview TEXT,
    date_collected DATE,
    bates_number VARCHAR(50),
    hash_value VARCHAR(128),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 4. LEGAL HOLDS
-- ============================================================
CREATE TABLE legal_holds (
    id SERIAL PRIMARY KEY,
    case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    hold_name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'released', 'pending', 'expired')),
    custodian_count INTEGER DEFAULT 0,
    issued_by VARCHAR(255),
    issued_date DATE,
    release_date DATE,
    hold_type VARCHAR(50) NOT NULL CHECK (hold_type IN ('litigation', 'regulatory', 'investigation')),
    notification_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 5. CUSTODIANS
-- ============================================================
CREATE TABLE custodians (
    id SERIAL PRIMARY KEY,
    case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    department VARCHAR(255),
    title VARCHAR(255),
    company VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
    data_sources TEXT,
    hold_status VARCHAR(50) DEFAULT 'pending' CHECK (hold_status IN ('on_hold', 'released', 'pending')),
    interview_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 6. COLLECTIONS
-- ============================================================
CREATE TABLE collections (
    id SERIAL PRIMARY KEY,
    case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    collection_name VARCHAR(255) NOT NULL,
    source_type VARCHAR(50) NOT NULL CHECK (source_type IN ('email', 'file_share', 'cloud', 'database', 'mobile', 'chat')),
    custodian VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
    total_items INTEGER DEFAULT 0,
    total_size_gb DECIMAL(10, 2),
    collected_by VARCHAR(255),
    collection_date DATE,
    verification_status VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 7. PROCESSING JOBS
-- ============================================================
CREATE TABLE processing_jobs (
    id SERIAL PRIMARY KEY,
    case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    job_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'paused')),
    total_documents INTEGER DEFAULT 0,
    processed_count INTEGER DEFAULT 0,
    duplicate_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    processing_type VARCHAR(50) NOT NULL CHECK (processing_type IN ('dedup', 'ocr', 'extraction', 'normalization')),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 8. REVIEW SETS
-- ============================================================
CREATE TABLE review_sets (
    id SERIAL PRIMARY KEY,
    case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    set_name VARCHAR(255) NOT NULL,
    description TEXT,
    total_documents INTEGER DEFAULT 0,
    reviewed_count INTEGER DEFAULT 0,
    relevant_count INTEGER DEFAULT 0,
    privileged_count INTEGER DEFAULT 0,
    reviewer VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 9. PRODUCTIONS
-- ============================================================
CREATE TABLE productions (
    id SERIAL PRIMARY KEY,
    case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    production_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'delivered')),
    format VARCHAR(20) NOT NULL CHECK (format IN ('native', 'tiff', 'pdf')),
    total_documents INTEGER DEFAULT 0,
    bates_prefix VARCHAR(20),
    bates_start INTEGER,
    bates_end INTEGER,
    recipient VARCHAR(255),
    delivery_date DATE,
    confidentiality_level VARCHAR(50) DEFAULT 'confidential' CHECK (confidentiality_level IN ('confidential', 'highly_confidential', 'attorneys_eyes_only', 'public')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 10. SEARCH QUERIES
-- ============================================================
CREATE TABLE search_queries (
    id SERIAL PRIMARY KEY,
    case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    query_name VARCHAR(255) NOT NULL,
    search_terms TEXT NOT NULL,
    query_type VARCHAR(50) NOT NULL CHECK (query_type IN ('keyword', 'boolean', 'concept', 'regex', 'proximity')),
    results_count INTEGER DEFAULT 0,
    created_by VARCHAR(255),
    date_range_start DATE,
    date_range_end DATE,
    file_types_filter VARCHAR(255),
    status VARCHAR(50) DEFAULT 'saved' CHECK (status IN ('saved', 'executed', 'archived')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 11. PREDICTIVE CODING
-- ============================================================
CREATE TABLE predictive_coding (
    id SERIAL PRIMARY KEY,
    case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    model_name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'training' CHECK (status IN ('training', 'active', 'completed', 'archived')),
    accuracy DECIMAL(5, 4),
    precision_score DECIMAL(5, 4),
    recall_score DECIMAL(5, 4),
    f1_score DECIMAL(5, 4),
    training_docs INTEGER DEFAULT 0,
    coded_docs INTEGER DEFAULT 0,
    algorithm VARCHAR(50) NOT NULL CHECK (algorithm IN ('logistic_regression', 'svm', 'random_forest', 'neural_network', 'transformer')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 12. PRIVILEGE LOGS
-- ============================================================
CREATE TABLE privilege_logs (
    id SERIAL PRIMARY KEY,
    case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    document_title VARCHAR(500) NOT NULL,
    bates_number VARCHAR(50),
    privilege_type VARCHAR(50) NOT NULL CHECK (privilege_type IN ('attorney_client', 'work_product', 'joint_defense', 'common_interest')),
    basis TEXT,
    author VARCHAR(255),
    recipients TEXT,
    date_of_communication DATE,
    status VARCHAR(50) DEFAULT 'logged' CHECK (status IN ('logged', 'challenged', 'upheld', 'waived')),
    reviewer VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 13. TIMELINE EVENTS
-- ============================================================
CREATE TABLE timeline_events (
    id SERIAL PRIMARY KEY,
    case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    event_title VARCHAR(500) NOT NULL,
    event_date DATE NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('communication', 'filing', 'meeting', 'transaction', 'incident', 'discovery')),
    source_document VARCHAR(255),
    participants TEXT,
    significance VARCHAR(20) DEFAULT 'medium' CHECK (significance IN ('high', 'medium', 'low')),
    ai_generated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 14. EMAIL THREADS
-- ============================================================
CREATE TABLE email_threads (
    id SERIAL PRIMARY KEY,
    case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    thread_subject VARCHAR(500) NOT NULL,
    participant_count INTEGER DEFAULT 0,
    message_count INTEGER DEFAULT 0,
    date_range VARCHAR(100),
    key_participants TEXT,
    has_attachments BOOLEAN DEFAULT FALSE,
    sentiment VARCHAR(50),
    relevance_score DECIMAL(5, 4),
    thread_summary TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 15. KEY TERMS
-- ============================================================
CREATE TABLE key_terms (
    id SERIAL PRIMARY KEY,
    case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    term VARCHAR(255) NOT NULL,
    frequency INTEGER DEFAULT 0,
    relevance_score DECIMAL(5, 4),
    category VARCHAR(50) NOT NULL CHECK (category IN ('person', 'organization', 'location', 'date', 'concept', 'financial')),
    context_snippet TEXT,
    first_occurrence DATE,
    last_occurrence DATE,
    document_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 16. ANOMALY ALERTS
-- ============================================================
CREATE TABLE anomaly_alerts (
    id SERIAL PRIMARY KEY,
    case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    alert_title VARCHAR(500) NOT NULL,
    description TEXT,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('data_gap', 'spike', 'pattern', 'unusual_access', 'deletion')),
    detected_date DATE,
    affected_custodian VARCHAR(255),
    affected_date_range VARCHAR(100),
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'investigating', 'resolved', 'dismissed')),
    ai_confidence DECIMAL(5, 4),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 17. COMPLIANCE RULES
-- ============================================================
CREATE TABLE compliance_rules (
    id SERIAL PRIMARY KEY,
    rule_name VARCHAR(255) NOT NULL,
    description TEXT,
    regulation VARCHAR(50) NOT NULL CHECK (regulation IN ('gdpr', 'hipaa', 'sox', 'fcpa', 'ccpa', 'sec', 'frcp')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'under_review')),
    last_checked TIMESTAMP,
    violations_count INTEGER DEFAULT 0,
    affected_cases INTEGER DEFAULT 0,
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    automated BOOLEAN DEFAULT FALSE,
    remediation_steps TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 18. DATA SOURCES
-- ============================================================
CREATE TABLE data_sources (
    id SERIAL PRIMARY KEY,
    case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    source_name VARCHAR(255) NOT NULL,
    source_type VARCHAR(50) NOT NULL CHECK (source_type IN ('exchange', 'sharepoint', 'onedrive', 'slack', 'teams', 'salesforce', 'box', 'google_workspace', 'local_server')),
    connection_status VARCHAR(50) DEFAULT 'pending' CHECK (connection_status IN ('connected', 'disconnected', 'error', 'pending')),
    custodian VARCHAR(255),
    total_items INTEGER DEFAULT 0,
    total_size_gb DECIMAL(10, 2),
    last_synced TIMESTAMP,
    credentials_stored BOOLEAN DEFAULT FALSE,
    collection_priority VARCHAR(20) DEFAULT 'medium' CHECK (collection_priority IN ('high', 'medium', 'low')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 19. ENTERPRISE COMPLETION MODULES
-- ============================================================
CREATE TABLE IF NOT EXISTS file_viewer_sessions (
    id SERIAL PRIMARY KEY,
    case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
    document_id INTEGER REFERENCES documents(id) ON DELETE SET NULL,
    viewer_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    preview_status VARCHAR(50),
    ocr_status VARCHAR(50),
    extracted_pages INTEGER DEFAULT 0,
    redaction_overlay BOOLEAN DEFAULT FALSE,
    last_viewed_by VARCHAR(255),
    last_viewed_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ingestion_pipelines (
    id SERIAL PRIMARY KEY,
    case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
    pipeline_name VARCHAR(255) NOT NULL,
    source_system VARCHAR(255),
    stage VARCHAR(100),
    status VARCHAR(50),
    items_ingested INTEGER DEFAULT 0,
    items_failed INTEGER DEFAULT 0,
    dedupe_rate DECIMAL(5,4),
    ocr_complete BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    owner VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS connector_syncs (
    id SERIAL PRIMARY KEY,
    case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
    connector_name VARCHAR(255) NOT NULL,
    provider VARCHAR(100),
    sync_status VARCHAR(50),
    last_sync_at TIMESTAMP,
    next_sync_at TIMESTAMP,
    records_synced INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    auth_status VARCHAR(50),
    owner VARCHAR(255),
    risk_level VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS review_assignments (
    id SERIAL PRIMARY KEY,
    case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
    review_set_id INTEGER REFERENCES review_sets(id) ON DELETE SET NULL,
    assignment_name VARCHAR(255) NOT NULL,
    reviewer VARCHAR(255),
    batch_size INTEGER DEFAULT 0,
    completed_count INTEGER DEFAULT 0,
    qc_required BOOLEAN DEFAULT FALSE,
    due_date DATE,
    priority VARCHAR(50),
    status VARCHAR(50),
    instructions TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS redaction_jobs (
    id SERIAL PRIMARY KEY,
    case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
    document_id INTEGER REFERENCES documents(id) ON DELETE SET NULL,
    redaction_name VARCHAR(255) NOT NULL,
    redaction_type VARCHAR(100),
    status VARCHAR(50),
    items_detected INTEGER DEFAULT 0,
    items_applied INTEGER DEFAULT 0,
    reviewer VARCHAR(255),
    confidence_score DECIMAL(5,4),
    completed_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS production_packages (
    id SERIAL PRIMARY KEY,
    case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
    production_id INTEGER REFERENCES productions(id) ON DELETE SET NULL,
    package_name VARCHAR(255) NOT NULL,
    package_type VARCHAR(100),
    status VARCHAR(50),
    document_count INTEGER DEFAULT 0,
    bates_start INTEGER,
    bates_end INTEGER,
    load_file_status VARCHAR(50),
    qc_status VARCHAR(50),
    delivered_at TIMESTAMP,
    recipient VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification_deliveries (
    id SERIAL PRIMARY KEY,
    case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
    notification_name VARCHAR(255) NOT NULL,
    channel VARCHAR(50),
    recipient VARCHAR(255),
    template_name VARCHAR(255),
    delivery_status VARCHAR(50),
    sent_at TIMESTAMP,
    acknowledged_at TIMESTAMP,
    retry_count INTEGER DEFAULT 0,
    priority VARCHAR(50),
    message_summary TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rbac_permissions (
    id SERIAL PRIMARY KEY,
    permission_name VARCHAR(255) NOT NULL,
    role_name VARCHAR(100),
    resource_area VARCHAR(100),
    access_level VARCHAR(100),
    enforced BOOLEAN DEFAULT FALSE,
    last_reviewed_at TIMESTAMP,
    reviewer VARCHAR(255),
    risk_level VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_binders (
    id SERIAL PRIMARY KEY,
    case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
    binder_name VARCHAR(255) NOT NULL,
    binder_type VARCHAR(100),
    status VARCHAR(50),
    evidence_count INTEGER DEFAULT 0,
    control_count INTEGER DEFAULT 0,
    export_format VARCHAR(50),
    generated_by VARCHAR(255),
    generated_at TIMESTAMP,
    signoff_status VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS background_jobs (
    id SERIAL PRIMARY KEY,
    case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
    job_name VARCHAR(255) NOT NULL,
    job_type VARCHAR(100),
    status VARCHAR(50),
    scheduled_at TIMESTAMP,
    started_at TIMESTAMP,
    finished_at TIMESTAMP,
    retry_count INTEGER DEFAULT 0,
    last_error TEXT,
    owner VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_governance_records (
    id SERIAL PRIMARY KEY,
    case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
    governance_name VARCHAR(255) NOT NULL,
    model_name VARCHAR(255),
    prompt_version VARCHAR(100),
    approval_status VARCHAR(50),
    approved_by VARCHAR(255),
    approved_at TIMESTAMP,
    cost_usd DECIMAL(10,2),
    fallback_model VARCHAR(255),
    reviewer_signoff BOOLEAN DEFAULT FALSE,
    risk_level VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX idx_documents_case_id ON documents(case_id);
CREATE INDEX idx_documents_review_status ON documents(review_status);
CREATE INDEX idx_documents_bates_number ON documents(bates_number);
CREATE INDEX idx_legal_holds_case_id ON legal_holds(case_id);
CREATE INDEX idx_legal_holds_status ON legal_holds(status);
CREATE INDEX idx_custodians_case_id ON custodians(case_id);
CREATE INDEX idx_collections_case_id ON collections(case_id);
CREATE INDEX idx_processing_jobs_case_id ON processing_jobs(case_id);
CREATE INDEX idx_processing_jobs_status ON processing_jobs(status);
CREATE INDEX idx_review_sets_case_id ON review_sets(case_id);
CREATE INDEX idx_productions_case_id ON productions(case_id);
CREATE INDEX idx_search_queries_case_id ON search_queries(case_id);
CREATE INDEX idx_predictive_coding_case_id ON predictive_coding(case_id);
CREATE INDEX idx_privilege_logs_case_id ON privilege_logs(case_id);
CREATE INDEX idx_timeline_events_case_id ON timeline_events(case_id);
CREATE INDEX idx_timeline_events_event_date ON timeline_events(event_date);
CREATE INDEX idx_email_threads_case_id ON email_threads(case_id);
CREATE INDEX idx_key_terms_case_id ON key_terms(case_id);
CREATE INDEX idx_anomaly_alerts_case_id ON anomaly_alerts(case_id);
CREATE INDEX idx_anomaly_alerts_severity ON anomaly_alerts(severity);
CREATE INDEX idx_data_sources_case_id ON data_sources(case_id);
CREATE INDEX IF NOT EXISTS idx_file_viewer_sessions_case_id ON file_viewer_sessions(case_id);
CREATE INDEX IF NOT EXISTS idx_ingestion_pipelines_case_id ON ingestion_pipelines(case_id);
CREATE INDEX IF NOT EXISTS idx_connector_syncs_case_id ON connector_syncs(case_id);
CREATE INDEX IF NOT EXISTS idx_review_assignments_case_id ON review_assignments(case_id);
CREATE INDEX IF NOT EXISTS idx_redaction_jobs_case_id ON redaction_jobs(case_id);
CREATE INDEX IF NOT EXISTS idx_production_packages_case_id ON production_packages(case_id);
CREATE INDEX IF NOT EXISTS idx_notification_deliveries_case_id ON notification_deliveries(case_id);
CREATE INDEX IF NOT EXISTS idx_audit_binders_case_id ON audit_binders(case_id);
CREATE INDEX IF NOT EXISTS idx_background_jobs_case_id ON background_jobs(case_id);
CREATE INDEX IF NOT EXISTS idx_ai_governance_records_case_id ON ai_governance_records(case_id);
CREATE INDEX idx_users_email ON users(email);

-- ============================================================
-- AI LOGS (audit trail with ai_results JSONB)
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_logs (
    id SERIAL PRIMARY KEY,
    endpoint VARCHAR(255) NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    case_id INTEGER REFERENCES cases(id) ON DELETE SET NULL,
    document_id INTEGER REFERENCES documents(id) ON DELETE SET NULL,
    input JSONB,
    ai_results JSONB,
    raw_response TEXT,
    model VARCHAR(255),
    tokens_used INTEGER,
    latency_ms INTEGER,
    status VARCHAR(50) DEFAULT 'success' CHECK (status IN ('success','parse_failed','error')),
    synthesized BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ai_logs_endpoint ON ai_logs(endpoint);
CREATE INDEX IF NOT EXISTS idx_ai_logs_user_id ON ai_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_case_id ON ai_logs(case_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_document_id ON ai_logs(document_id);

-- ============================================================
-- DOCUMENT FILES (uploaded files + extracted text + hash for dedup)
-- ============================================================
CREATE TABLE IF NOT EXISTS document_files (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    filename VARCHAR(500),
    storage_path VARCHAR(1000),
    file_hash VARCHAR(128),
    extracted_text TEXT,
    extraction_status VARCHAR(50) DEFAULT 'pending' CHECK (extraction_status IN ('pending','extracted','failed','duplicate')),
    duplicate_of INTEGER REFERENCES document_files(id) ON DELETE SET NULL,
    uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_document_files_hash ON document_files(file_hash);
CREATE INDEX IF NOT EXISTS idx_document_files_document_id ON document_files(document_id);

-- ============================================================
-- TAR (Technology-Assisted Review) seed decisions and scores
-- ============================================================
CREATE TABLE IF NOT EXISTS tar_seed_decisions (
    id SERIAL PRIMARY KEY,
    case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    decision VARCHAR(50) NOT NULL CHECK (decision IN ('relevant','not_relevant','privileged','hot')),
    confidence DECIMAL(3,2),
    reviewer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tar_predictions (
    id SERIAL PRIMARY KEY,
    case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    predicted_relevance DECIMAL(4,3),
    predicted_label VARCHAR(50),
    is_borderline BOOLEAN DEFAULT FALSE,
    ai_results JSONB,
    raw_response TEXT,
    model VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tar_seed_case ON tar_seed_decisions(case_id);
CREATE INDEX IF NOT EXISTS idx_tar_predictions_case ON tar_predictions(case_id);
CREATE INDEX IF NOT EXISTS idx_tar_predictions_borderline ON tar_predictions(is_borderline);

-- ============================================================
-- Email thread groups (reconstruction)
-- ============================================================
CREATE TABLE IF NOT EXISTS email_thread_groups (
    id SERIAL PRIMARY KEY,
    case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
    subject VARCHAR(500),
    participants TEXT[],
    message_ids JSONB,
    gap_count INTEGER DEFAULT 0,
    gaps_detected JSONB,
    ai_summary TEXT,
    ai_results JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_email_thread_groups_case_id ON email_thread_groups(case_id);

-- ============================================================
-- Privilege log exports
-- ============================================================
CREATE TABLE IF NOT EXISTS privilege_log_exports (
    id SERIAL PRIMARY KEY,
    case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
    generated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    document_count INTEGER,
    storage_path VARCHAR(1000),
    file_format VARCHAR(20) DEFAULT 'pdf',
    ai_summary TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- Deposition video timelines (chapters)
-- ============================================================
CREATE TABLE IF NOT EXISTS deposition_timelines (
    id SERIAL PRIMARY KEY,
    case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
    deposition_name VARCHAR(255),
    witness_name VARCHAR(255),
    chapters JSONB,
    linked_event_ids JSONB,
    linked_exhibit_doc_ids JSONB,
    ai_results JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_deposition_timelines_case_id ON deposition_timelines(case_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_case_number ON cases(case_number);

-- ============================================================
-- TRIGGER: auto-update updated_at on row modification
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON cases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_legal_holds_updated_at BEFORE UPDATE ON legal_holds FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_custodians_updated_at BEFORE UPDATE ON custodians FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON collections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_processing_jobs_updated_at BEFORE UPDATE ON processing_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_review_sets_updated_at BEFORE UPDATE ON review_sets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_productions_updated_at BEFORE UPDATE ON productions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_search_queries_updated_at BEFORE UPDATE ON search_queries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_predictive_coding_updated_at BEFORE UPDATE ON predictive_coding FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_privilege_logs_updated_at BEFORE UPDATE ON privilege_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_timeline_events_updated_at BEFORE UPDATE ON timeline_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_threads_updated_at BEFORE UPDATE ON email_threads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_key_terms_updated_at BEFORE UPDATE ON key_terms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_anomaly_alerts_updated_at BEFORE UPDATE ON anomaly_alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_compliance_rules_updated_at BEFORE UPDATE ON compliance_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_data_sources_updated_at BEFORE UPDATE ON data_sources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_file_viewer_sessions_updated_at BEFORE UPDATE ON file_viewer_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ingestion_pipelines_updated_at BEFORE UPDATE ON ingestion_pipelines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_connector_syncs_updated_at BEFORE UPDATE ON connector_syncs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_review_assignments_updated_at BEFORE UPDATE ON review_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_redaction_jobs_updated_at BEFORE UPDATE ON redaction_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_production_packages_updated_at BEFORE UPDATE ON production_packages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_deliveries_updated_at BEFORE UPDATE ON notification_deliveries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rbac_permissions_updated_at BEFORE UPDATE ON rbac_permissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_audit_binders_updated_at BEFORE UPDATE ON audit_binders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_background_jobs_updated_at BEFORE UPDATE ON background_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_governance_records_updated_at BEFORE UPDATE ON ai_governance_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
