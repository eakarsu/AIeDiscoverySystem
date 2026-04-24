-- ============================================================
-- AI eDiscovery System - Seed Data
-- ============================================================

-- ============================================================
-- 1. USERS (3 rows)
-- ============================================================
INSERT INTO users (email, password_hash, full_name, role, firm_name, is_active) VALUES
('admin@ediscovery.com', '$2a$10$DFLx9vBBnXfoyzwTk8c6SOOxm4pEr59S9ga6nR/sl9mO3lSAHPN96', 'Sarah Mitchell', 'admin', 'Mitchell & Associates LLP', TRUE),
('attorney@lawfirm.com', '$2a$10$Iu2EkT.Mz2MF5iAP5Hz2l.9dpzx6cPypyml5ZrUcOaXu52w.Ro7Wi', 'James Crawford', 'attorney', 'Crawford Blackwell LLP', TRUE),
('reviewer@lawfirm.com', '$2a$10$4Q6L15dbE/AygYQflNfX5.ljkOpYGLEvzfdQpWTYoHU7gdkX1TfUe', 'Emily Zhang', 'reviewer', 'Crawford Blackwell LLP', TRUE);

-- ============================================================
-- 2. CASES (15 rows)
-- ============================================================
INSERT INTO cases (case_name, case_number, client_name, matter_type, status, description, lead_attorney, date_filed, court_jurisdiction, opposing_counsel, priority) VALUES
('Meridian Corp v. Apex Technologies', 'CV-2025-00142', 'Meridian Corporation', 'litigation', 'active', 'Trade secret misappropriation claim involving proprietary algorithm source code and engineering documents.', 'James Crawford', '2025-03-15', 'S.D.N.Y.', 'Patterson & Holmes LLP', 'high'),
('In re: GlobalBank Securities Fraud', 'MDL-2025-01987', 'GlobalBank Holdings Inc.', 'investigation', 'active', 'SEC investigation into potential securities fraud related to Q3 2024 earnings restatement.', 'James Crawford', '2025-06-01', 'D. Del.', 'SEC Division of Enforcement', 'high'),
('TechVault Data Breach Litigation', 'CV-2025-03341', 'TechVault Inc.', 'litigation', 'active', 'Class action lawsuit arising from unauthorized data breach exposing 2.3M customer records.', 'James Crawford', '2025-07-20', 'N.D. Cal.', 'Lieff Cabraser LLP', 'high'),
('Pinnacle Pharma FDA Compliance Review', 'REG-2025-00089', 'Pinnacle Pharmaceuticals', 'regulatory', 'active', 'FDA regulatory compliance review of clinical trial data integrity and manufacturing practices.', 'James Crawford', '2025-04-10', 'FDA Administrative', 'FDA Office of Regulatory Affairs', 'medium'),
('Baxter Industries FCPA Investigation', 'INV-2025-00456', 'Baxter Industries Ltd.', 'investigation', 'active', 'Internal investigation into potential Foreign Corrupt Practices Act violations in Southeast Asia operations.', 'James Crawford', '2025-05-22', 'D.D.C.', 'DOJ Criminal Division', 'high'),
('Sterling Automotive Patent Dispute', 'CV-2025-04521', 'Sterling Automotive Group', 'litigation', 'pending', 'Patent infringement claim related to autonomous driving sensor technology.', 'James Crawford', '2025-08-11', 'E.D. Tex.', 'Fish & Richardson', 'medium'),
('Hartwell Energy Antitrust Inquiry', 'INV-2025-00712', 'Hartwell Energy Corp.', 'investigation', 'active', 'DOJ antitrust investigation into potential price-fixing in natural gas markets.', 'James Crawford', '2025-09-03', 'D.D.C.', 'DOJ Antitrust Division', 'high'),
('Nexus Health HIPAA Compliance Audit', 'COMP-2025-00233', 'Nexus Health Systems', 'compliance', 'active', 'Enterprise-wide HIPAA compliance audit following acquisition of three regional hospital networks.', 'James Crawford', '2025-02-14', 'HHS Administrative', 'HHS Office for Civil Rights', 'medium'),
('Orelius Mining Environmental Action', 'CV-2025-05678', 'Orelius Mining Inc.', 'litigation', 'active', 'Environmental contamination litigation involving groundwater pollution near mining operations in Nevada.', 'James Crawford', '2025-10-01', 'D. Nev.', 'Earthjustice', 'medium'),
('Quantum Financial SOX Review', 'COMP-2025-00401', 'Quantum Financial Services', 'compliance', 'pending', 'Sarbanes-Oxley compliance review following whistleblower allegations regarding internal controls.', 'James Crawford', '2025-11-15', 'SEC Administrative', 'SEC Enforcement Division', 'high'),
('Centurion Defense Whistleblower', 'INV-2025-00890', 'Centurion Defense Systems', 'investigation', 'active', 'Internal investigation into False Claims Act whistleblower allegations related to government contracts.', 'James Crawford', '2025-01-20', 'E.D. Va.', 'DOJ Civil Division', 'high'),
('Opal Retail Consumer Class Action', 'CV-2025-06234', 'Opal Retail Holdings', 'litigation', 'closed', 'Consumer class action alleging deceptive marketing practices in subscription billing program.', 'James Crawford', '2024-09-15', 'C.D. Cal.', 'Girard Sharp LLP', 'low'),
('Atlas Logistics Employment Dispute', 'CV-2025-07891', 'Atlas Logistics Corp.', 'litigation', 'active', 'Collective action under FLSA for alleged unpaid overtime for warehouse operations employees.', 'James Crawford', '2025-12-01', 'S.D. Tex.', 'Sanford Heisler Sharp LLP', 'medium'),
('Silverline Telecom CCPA Investigation', 'REG-2025-00567', 'Silverline Telecom', 'regulatory', 'pending', 'California Attorney General investigation into CCPA data sale notification violations.', 'James Crawford', '2025-08-30', 'Cal. Superior Court', 'California DOJ', 'medium'),
('Vanguard Aerospace IP Theft', 'CV-2025-08123', 'Vanguard Aerospace Corp.', 'litigation', 'active', 'Trade secret and IP theft claim against former CTO who joined competitor with proprietary design files.', 'James Crawford', '2026-01-10', 'D. Conn.', 'Skadden Arps LLP', 'high');

-- ============================================================
-- 3. DOCUMENTS (15 rows)
-- ============================================================
INSERT INTO documents (case_id, title, file_type, file_size_mb, custodian, source, review_status, content_preview, date_collected, bates_number, hash_value) VALUES
(1, 'Algorithm Design Specification v3.2', 'pdf', 4.75, 'David Chen', 'Engineering File Share', 'hot', 'This document outlines the proprietary neural network architecture used in Meridian predictive analytics engine...', '2025-04-01', 'MER-00001', 'a3f2b8c91d4e5f6071829a3b4c5d6e7f8091a2b3c4d5e6f7'),
(1, 'Email: Re: Apex Offer Letter - Confidential', 'eml', 0.34, 'Michael Torres', 'Exchange Server', 'relevant', 'Michael, Congratulations on the offer from Apex. Before your last day, please ensure all project files are backed up...', '2025-04-01', 'MER-00002', 'b4c5d6e7f8091a2b3c4d5e6f70182939a0b1c2d3e4f5a6b7'),
(1, 'Source Code Repository Access Log', 'csv', 12.40, 'IT Department', 'Git Server Logs', 'relevant', 'timestamp,user,repository,action,ip_address\n2024-12-01T23:45:00,mtorres,algo-core,clone,192.168.1.45...', '2025-04-02', 'MER-00003', 'c5d6e7f80192a3b4c5d6e7f801829a3b4c5d6e7f0182939a'),
(2, 'Q3 2024 Revenue Recognition Workbook', 'xlsx', 8.90, 'Jennifer Walsh', 'Finance SharePoint', 'hot', 'Revenue adjustments for Q3 showing $47M variance between preliminary and final reported figures...', '2025-06-15', 'GLB-00001', 'd6e7f8019a3b4c5d6e7f80192a3b4c5d6e7f01829a3b4c5d'),
(2, 'Board Meeting Minutes - August 2024', 'docx', 1.25, 'Robert Kim', 'Board Portal', 'privileged', 'Minutes of the Board of Directors special meeting held August 15, 2024. Discussion of earnings guidance...', '2025-06-15', 'GLB-00002', 'e7f80192a3b4c5d6e7f8019a3b4c5d6e7f01829a3b4c5d6e'),
(2, 'Internal Audit Report - Revenue Controls', 'pdf', 3.60, 'Samantha Green', 'Internal Audit Portal', 'relevant', 'Finding 2024-IA-017: Material weakness identified in revenue recognition process for long-term service contracts...', '2025-06-20', 'GLB-00003', 'f80192a3b4c5d6e7f8019a2b3c4d5e6f7g01829a3b4c5d6e'),
(3, 'Incident Response Timeline - March 2025', 'pdf', 2.15, 'Carlos Rivera', 'InfoSec Team', 'hot', 'March 12, 2025 02:14 UTC - Anomalous outbound traffic detected from DB server prod-db-07. March 12, 2025 02:47 UTC - SOC alerted...', '2025-07-25', 'TVT-00001', '0192a3b4c5d6e7f80192a3b4c5d6e7f801829a3b4c5d6e7f'),
(3, 'Customer PII Data Inventory', 'xlsx', 15.70, 'Maria Santos', 'Data Governance', 'relevant', 'Database: customers_prod, Table: user_profiles, PII Fields: SSN, DOB, email, phone, address...', '2025-07-25', 'TVT-00002', '192a3b4c5d6e7f80192a3b4c5d6e7f801829a3b4c5d6e7f0'),
(3, 'Breach Notification Draft - Legal Review', 'docx', 0.87, 'James Crawford', 'Legal DMS', 'privileged', 'DRAFT - ATTORNEY-CLIENT PRIVILEGED. Proposed notification to affected individuals pursuant to Cal. Civ. Code 1798.82...', '2025-07-30', 'TVT-00003', '92a3b4c5d6e7f80192a3b4c5d6e7f801829a3b4c5d6e7f01'),
(4, 'Clinical Trial Protocol - Study PNX-401', 'pdf', 22.30, 'Dr. Lisa Park', 'Clinical Operations', 'relevant', 'Phase III randomized double-blind placebo-controlled study to evaluate efficacy and safety of PNX-401...', '2025-04-20', 'PIN-00001', 'a3b4c5d6e7f80192a3b4c5d6e7f801829a3b4c5d6e7f0192'),
(4, 'Manufacturing Batch Records - Lot 2024-789', 'pdf', 6.40, 'Thomas Wright', 'Quality Assurance', 'relevant', 'Batch production record for PNX-401 active pharmaceutical ingredient, Lot 2024-789. Yield: 94.2%...', '2025-04-22', 'PIN-00002', 'b4c5d6e7f80192a3b4c5d6e7f801829a3b4c5d6e7f01920a'),
(5, 'Wire Transfer Records - Singapore Office', 'xlsx', 3.20, 'Angela Foster', 'Treasury Department', 'hot', 'Payment records showing 47 wire transfers totaling $2.3M to third-party consultants in Indonesia and Malaysia...', '2025-06-01', 'BAX-00001', 'c5d6e7f80192a3b4c5d6e7f801829a3b4c5d6e7f01920ab3'),
(5, 'Agent Commission Agreements - SE Asia', 'pdf', 1.80, 'David Nakamura', 'Legal DMS', 'relevant', 'Consulting Services Agreement between Baxter Industries SE Asia Pte Ltd and PT Jaya Mandiri Consulting...', '2025-06-05', 'BAX-00002', 'd6e7f80192a3b4c5d6e7f801829a3b4c5d6e7f01920ab3c4'),
(5, 'Travel and Entertainment Expense Reports', 'csv', 7.50, 'Regional Managers', 'SAP Finance', 'relevant', 'employee_id,date,vendor,amount,category,description\nSEA-0042,2024-06-15,Grand Hyatt Jakarta,4250.00,entertainment,Government officials dinner...', '2025-06-10', 'BAX-00003', 'e7f80192a3b4c5d6e7f801829a3b4c5d6e7f01920ab3c4d5'),
(1, 'Non-Compete Agreement - Michael Torres', 'pdf', 0.52, 'HR Department', 'HRIS System', 'hot', 'RESTRICTIVE COVENANT AGREEMENT. Employee agrees that for a period of 24 months following termination...', '2025-04-03', 'MER-00004', 'f80192a3b4c5d6e7f801829a3b4c5d6e7f01920ab3c4d5e6'),
(3, 'Firewall Configuration Export - Q1 2025', 'txt', 45.20, 'Network Operations', 'Palo Alto NGFW', 'relevant', 'policy id=4521 action=allow src=10.0.0.0/8 dst=any service=HTTPS log=yes\npolicy id=4522 action=deny...', '2025-07-26', 'TVT-00004', '80192a3b4c5d6e7f801829a3b4c5d6e7f01920ab3c4d5e6f');

-- ============================================================
-- 4. LEGAL HOLDS (15 rows)
-- ============================================================
INSERT INTO legal_holds (case_id, hold_name, description, status, custodian_count, issued_by, issued_date, release_date, hold_type, notification_sent) VALUES
(1, 'Meridian v. Apex - Engineering Hold', 'Preservation of all engineering documents, source code, and communications related to proprietary algorithms.', 'active', 12, 'James Crawford', '2025-03-20', NULL, 'litigation', TRUE),
(1, 'Meridian v. Apex - HR Records Hold', 'Preservation of all HR records for departed employees including Torres, Chen, and Patel.', 'active', 5, 'James Crawford', '2025-03-20', NULL, 'litigation', TRUE),
(2, 'GlobalBank - Finance Department Hold', 'Preservation of all financial records, workpapers, and communications for Q3 2024 reporting period.', 'active', 23, 'James Crawford', '2025-06-05', NULL, 'investigation', TRUE),
(2, 'GlobalBank - Executive Communications Hold', 'Preservation of all C-suite and VP-level communications from June 2024 through present.', 'active', 8, 'James Crawford', '2025-06-05', NULL, 'investigation', TRUE),
(3, 'TechVault - IT Security Hold', 'Preservation of all network logs, firewall configs, access logs, and incident response documentation.', 'active', 15, 'James Crawford', '2025-07-22', NULL, 'litigation', TRUE),
(3, 'TechVault - Customer Data Hold', 'Preservation of all customer PII records, data processing logs, and privacy impact assessments.', 'active', 10, 'James Crawford', '2025-07-22', NULL, 'litigation', TRUE),
(4, 'Pinnacle Pharma - Clinical Trial Hold', 'Preservation of all clinical trial data, protocols, adverse event reports, and FDA correspondence.', 'active', 18, 'James Crawford', '2025-04-12', NULL, 'regulatory', TRUE),
(5, 'Baxter FCPA - Asia Pacific Hold', 'Preservation of all financial records, agent agreements, and communications for SE Asia operations.', 'active', 20, 'James Crawford', '2025-05-25', NULL, 'investigation', TRUE),
(5, 'Baxter FCPA - Travel & Expense Hold', 'Preservation of all T&E records, gift logs, and hospitality approvals for Asia Pacific region.', 'active', 14, 'James Crawford', '2025-05-25', NULL, 'investigation', TRUE),
(1, 'Meridian v. Apex - IT Systems Hold', 'Preservation of all VPN logs, badge access records, and USB device connection logs.', 'active', 4, 'Sarah Mitchell', '2025-03-25', NULL, 'litigation', TRUE),
(4, 'Pinnacle - Manufacturing QA Hold', 'Preservation of all batch records, deviation reports, and CAPA documentation.', 'active', 9, 'James Crawford', '2025-04-15', NULL, 'regulatory', TRUE),
(2, 'GlobalBank - External Auditor Hold', 'Preservation of all communications with external auditors during Q3 2024 audit cycle.', 'active', 6, 'James Crawford', '2025-06-10', NULL, 'investigation', TRUE),
(3, 'TechVault - Third Party Vendor Hold', 'Preservation of all contracts and communications with cloud infrastructure vendors.', 'pending', 7, 'Sarah Mitchell', '2025-08-01', NULL, 'litigation', FALSE),
(5, 'Baxter FCPA - Legal Department Hold', 'Preservation of all compliance training records and anti-corruption policy acknowledgments.', 'active', 11, 'James Crawford', '2025-05-28', NULL, 'investigation', TRUE),
(1, 'Meridian v. Apex - Sales Records Hold', 'Preservation of all sales pipeline data and customer relationship records accessed by departing employees.', 'released', 3, 'James Crawford', '2025-03-22', '2025-09-15', 'litigation', TRUE);

-- ============================================================
-- 5. CUSTODIANS (15 rows)
-- ============================================================
INSERT INTO custodians (case_id, full_name, email, department, title, company, status, data_sources, hold_status, interview_date) VALUES
(1, 'Michael Torres', 'mtorres@meridian.com', 'Engineering', 'Senior Software Architect', 'Meridian Corporation', 'terminated', 'Email, OneDrive, Git, Slack', 'on_hold', '2025-04-10'),
(1, 'David Chen', 'dchen@meridian.com', 'Engineering', 'VP of Engineering', 'Meridian Corporation', 'active', 'Email, OneDrive, Git, Slack, Jira', 'on_hold', '2025-04-12'),
(1, 'Priya Patel', 'ppatel@meridian.com', 'Engineering', 'Machine Learning Engineer', 'Meridian Corporation', 'terminated', 'Email, OneDrive, Git, Jupyter', 'on_hold', '2025-04-15'),
(2, 'Jennifer Walsh', 'jwalsh@globalbank.com', 'Finance', 'CFO', 'GlobalBank Holdings Inc.', 'active', 'Email, SharePoint, Bloomberg Terminal, SAP', 'on_hold', '2025-07-01'),
(2, 'Robert Kim', 'rkim@globalbank.com', 'Legal', 'General Counsel', 'GlobalBank Holdings Inc.', 'active', 'Email, SharePoint, Board Portal', 'on_hold', '2025-07-03'),
(2, 'Samantha Green', 'sgreen@globalbank.com', 'Internal Audit', 'Chief Audit Officer', 'GlobalBank Holdings Inc.', 'active', 'Email, SharePoint, Audit Management System', 'on_hold', '2025-07-05'),
(3, 'Carlos Rivera', 'crivera@techvault.io', 'Information Security', 'CISO', 'TechVault Inc.', 'active', 'Email, Slack, Jira, Splunk, PagerDuty', 'on_hold', '2025-08-05'),
(3, 'Maria Santos', 'msantos@techvault.io', 'Data Governance', 'Data Protection Officer', 'TechVault Inc.', 'active', 'Email, OneDrive, Collibra', 'on_hold', '2025-08-07'),
(4, 'Dr. Lisa Park', 'lpark@pinnaclepharma.com', 'Clinical Operations', 'VP Clinical Development', 'Pinnacle Pharmaceuticals', 'active', 'Email, Veeva Vault, eTMF, CTMS', 'on_hold', '2025-05-01'),
(4, 'Thomas Wright', 'twright@pinnaclepharma.com', 'Quality Assurance', 'Director of Quality', 'Pinnacle Pharmaceuticals', 'active', 'Email, TrackWise, SAP QM', 'on_hold', '2025-05-03'),
(5, 'Angela Foster', 'afoster@baxter-ind.com', 'Treasury', 'Regional Treasury Manager - APAC', 'Baxter Industries Ltd.', 'active', 'Email, SAP, Banking Portals', 'on_hold', '2025-06-15'),
(5, 'David Nakamura', 'dnakamura@baxter-ind.com', 'Legal', 'Associate General Counsel - Asia', 'Baxter Industries Ltd.', 'active', 'Email, SharePoint, DMS', 'on_hold', '2025-06-18'),
(5, 'Raymond Tan', 'rtan@baxter-ind.com', 'Operations', 'Country Manager - Indonesia', 'Baxter Industries Ltd.', 'active', 'Email, WeChat, WhatsApp, SAP', 'on_hold', '2025-06-20'),
(1, 'Karen Mitchell', 'kmitchell@meridian.com', 'Human Resources', 'HR Director', 'Meridian Corporation', 'active', 'Email, Workday, SharePoint', 'on_hold', '2025-04-08'),
(2, 'Marcus Thompson', 'mthompson@globalbank.com', 'Accounting', 'Controller', 'GlobalBank Holdings Inc.', 'active', 'Email, SAP, BlackLine, SharePoint', 'on_hold', '2025-07-08');

-- ============================================================
-- 6. COLLECTIONS (15 rows)
-- ============================================================
INSERT INTO collections (case_id, collection_name, source_type, custodian, status, total_items, total_size_gb, collected_by, collection_date, verification_status) VALUES
(1, 'Torres Email Collection - Full Mailbox', 'email', 'Michael Torres', 'completed', 34521, 12.40, 'Sarah Mitchell', '2025-04-05', 'verified'),
(1, 'Torres OneDrive Collection', 'cloud', 'Michael Torres', 'completed', 8934, 45.70, 'Sarah Mitchell', '2025-04-05', 'verified'),
(1, 'Engineering Git Repositories', 'file_share', 'David Chen', 'completed', 156432, 78.30, 'Sarah Mitchell', '2025-04-06', 'verified'),
(2, 'Walsh Email - Exchange Online', 'email', 'Jennifer Walsh', 'completed', 67234, 28.50, 'Sarah Mitchell', '2025-06-18', 'verified'),
(2, 'Finance SharePoint Site Collection', 'cloud', 'Jennifer Walsh', 'completed', 23456, 34.20, 'Sarah Mitchell', '2025-06-19', 'verified'),
(2, 'Bloomberg Terminal Communications', 'chat', 'Jennifer Walsh', 'completed', 12890, 2.10, 'Sarah Mitchell', '2025-06-20', 'verified'),
(3, 'Rivera Email & Slack Collection', 'email', 'Carlos Rivera', 'completed', 45678, 15.60, 'Sarah Mitchell', '2025-07-28', 'verified'),
(3, 'Network Infrastructure Logs', 'database', 'Carlos Rivera', 'in_progress', 890234, 156.80, 'Sarah Mitchell', '2025-07-29', 'pending'),
(3, 'Santos Mobile Device Collection', 'mobile', 'Maria Santos', 'completed', 3456, 8.90, 'Sarah Mitchell', '2025-07-30', 'verified'),
(4, 'Clinical Trial Management System Export', 'database', 'Dr. Lisa Park', 'completed', 78901, 42.30, 'Sarah Mitchell', '2025-04-25', 'verified'),
(4, 'Quality Assurance Document Repository', 'file_share', 'Thomas Wright', 'completed', 34567, 67.80, 'Sarah Mitchell', '2025-04-26', 'verified'),
(5, 'APAC Treasury SAP Export', 'database', 'Angela Foster', 'completed', 56789, 23.40, 'Sarah Mitchell', '2025-06-08', 'verified'),
(5, 'SE Asia Office Email Collection', 'email', 'Raymond Tan', 'completed', 89012, 31.20, 'Sarah Mitchell', '2025-06-09', 'verified'),
(5, 'WeChat and WhatsApp Messages', 'chat', 'Raymond Tan', 'in_progress', 23456, 4.70, 'Sarah Mitchell', '2025-06-12', 'pending'),
(1, 'Meridian Slack Workspace Export', 'chat', 'David Chen', 'completed', 234567, 18.90, 'Sarah Mitchell', '2025-04-07', 'verified');

-- ============================================================
-- 7. PROCESSING JOBS (15 rows)
-- ============================================================
INSERT INTO processing_jobs (case_id, job_name, status, total_documents, processed_count, duplicate_count, error_count, processing_type, started_at, completed_at) VALUES
(1, 'Meridian Email Deduplication', 'completed', 34521, 34521, 8234, 12, 'dedup', '2025-04-06 08:00:00', '2025-04-06 14:32:00'),
(1, 'Torres Files OCR Processing', 'completed', 8934, 8934, 0, 45, 'ocr', '2025-04-07 09:00:00', '2025-04-07 22:15:00'),
(1, 'Engineering Docs Text Extraction', 'completed', 156432, 156432, 34521, 234, 'extraction', '2025-04-08 06:00:00', '2025-04-10 18:00:00'),
(2, 'GlobalBank Email Deduplication', 'completed', 67234, 67234, 15678, 23, 'dedup', '2025-06-20 08:00:00', '2025-06-20 19:45:00'),
(2, 'Finance Docs OCR Processing', 'completed', 23456, 23456, 0, 89, 'ocr', '2025-06-21 08:00:00', '2025-06-22 04:30:00'),
(2, 'GlobalBank Data Normalization', 'completed', 90690, 90690, 0, 56, 'normalization', '2025-06-23 06:00:00', '2025-06-24 12:00:00'),
(3, 'TechVault Email Deduplication', 'completed', 45678, 45678, 12345, 34, 'dedup', '2025-08-01 08:00:00', '2025-08-01 16:20:00'),
(3, 'Network Log Text Extraction', 'processing', 890234, 456789, 0, 567, 'extraction', '2025-08-02 06:00:00', NULL),
(3, 'Mobile Device OCR', 'completed', 3456, 3456, 0, 12, 'ocr', '2025-08-03 10:00:00', '2025-08-03 13:45:00'),
(4, 'Pinnacle Clinical Docs Extraction', 'completed', 78901, 78901, 5678, 123, 'extraction', '2025-04-28 08:00:00', '2025-04-30 20:00:00'),
(4, 'QA Records Normalization', 'completed', 34567, 34567, 0, 45, 'normalization', '2025-05-01 08:00:00', '2025-05-02 14:00:00'),
(5, 'Baxter Financial Data Dedup', 'completed', 56789, 56789, 9876, 67, 'dedup', '2025-06-12 08:00:00', '2025-06-12 18:30:00'),
(5, 'Asia Email OCR - Multilingual', 'completed', 89012, 89012, 0, 345, 'ocr', '2025-06-13 06:00:00', '2025-06-15 22:00:00'),
(5, 'Chat Messages Extraction', 'processing', 23456, 12340, 0, 89, 'extraction', '2025-06-16 08:00:00', NULL),
(1, 'Slack Messages Normalization', 'completed', 234567, 234567, 45678, 123, 'normalization', '2025-04-09 06:00:00', '2025-04-11 08:00:00');

-- ============================================================
-- 8. REVIEW SETS (15 rows)
-- ============================================================
INSERT INTO review_sets (case_id, set_name, description, total_documents, reviewed_count, relevant_count, privileged_count, reviewer, status, priority) VALUES
(1, 'Meridian - Hot Documents', 'Priority review of documents flagged by AI as highly relevant to trade secret claims.', 2456, 2456, 1823, 234, 'Emily Zhang', 'completed', 'high'),
(1, 'Meridian - Torres Communications', 'All email and chat communications involving Michael Torres from Jan-Mar 2025.', 8934, 6721, 3456, 567, 'Emily Zhang', 'active', 'high'),
(1, 'Meridian - Source Code Files', 'Technical review of source code and documentation files for proprietary content.', 4567, 1234, 890, 45, 'Emily Zhang', 'active', 'medium'),
(2, 'GlobalBank - Revenue Documents', 'Documents related to Q3 2024 revenue recognition and adjustments.', 12345, 12345, 8901, 1234, 'Emily Zhang', 'completed', 'high'),
(2, 'GlobalBank - Executive Communications', 'C-suite email communications during Q3 2024 earnings period.', 5678, 3456, 2345, 890, 'Emily Zhang', 'active', 'high'),
(2, 'GlobalBank - Auditor Correspondence', 'All communications with external auditors during relevant period.', 3456, 3456, 2100, 567, 'Emily Zhang', 'completed', 'medium'),
(3, 'TechVault - Incident Response Docs', 'All documents related to breach detection, investigation, and response.', 7890, 7890, 6543, 234, 'Emily Zhang', 'completed', 'high'),
(3, 'TechVault - Customer Data Records', 'Documents identifying scope and nature of compromised customer data.', 15678, 8901, 7234, 456, 'Emily Zhang', 'active', 'high'),
(4, 'Pinnacle - Clinical Protocol Docs', 'Clinical trial protocols, amendments, and regulatory submissions.', 9012, 5678, 4567, 890, 'Emily Zhang', 'active', 'medium'),
(4, 'Pinnacle - Manufacturing Records', 'Batch records, deviation reports, and CAPA documentation.', 6789, 6789, 4321, 123, 'Emily Zhang', 'completed', 'medium'),
(5, 'Baxter - Payment Records', 'Wire transfers, invoices, and payment approvals for SE Asia operations.', 11234, 8901, 7654, 345, 'Emily Zhang', 'active', 'high'),
(5, 'Baxter - Agent Communications', 'All communications with third-party agents and consultants in APAC.', 8901, 4567, 3210, 678, 'Emily Zhang', 'active', 'high'),
(5, 'Baxter - Compliance Training Records', 'FCPA training records and anti-corruption policy acknowledgments.', 4567, 4567, 1234, 56, 'Emily Zhang', 'completed', 'low'),
(1, 'Meridian - Patel Documents', 'All documents collected from Priya Patel workstation and accounts.', 6234, 2100, 1567, 345, 'Emily Zhang', 'active', 'medium'),
(3, 'TechVault - Vendor Security Assessments', 'Third-party vendor security questionnaires and audit reports.', 3456, 1234, 890, 123, 'Emily Zhang', 'paused', 'low');

-- ============================================================
-- 9. PRODUCTIONS (15 rows)
-- ============================================================
INSERT INTO productions (case_id, production_name, status, format, total_documents, bates_prefix, bates_start, bates_end, recipient, delivery_date, confidentiality_level) VALUES
(1, 'Meridian First Production - Core Docs', 'delivered', 'tiff', 5678, 'MER', 1, 5678, 'Patterson & Holmes LLP', '2025-06-15', 'confidential'),
(1, 'Meridian Second Production - Source Code', 'delivered', 'native', 2345, 'MER', 5679, 8023, 'Patterson & Holmes LLP', '2025-07-30', 'attorneys_eyes_only'),
(1, 'Meridian Third Production - HR Records', 'in_progress', 'tiff', 1234, 'MER', 8024, 9257, 'Patterson & Holmes LLP', NULL, 'highly_confidential'),
(2, 'GlobalBank First Production - Financial', 'delivered', 'pdf', 8901, 'GLB', 1, 8901, 'SEC Division of Enforcement', '2025-08-15', 'confidential'),
(2, 'GlobalBank Second Production - Communications', 'delivered', 'tiff', 12345, 'GLB', 8902, 21246, 'SEC Division of Enforcement', '2025-09-30', 'confidential'),
(2, 'GlobalBank Third Production - Audit Docs', 'in_progress', 'pdf', 3456, 'GLB', 21247, 24702, 'SEC Division of Enforcement', NULL, 'highly_confidential'),
(3, 'TechVault Initial Disclosure', 'delivered', 'native', 4567, 'TVT', 1, 4567, 'Lieff Cabraser LLP', '2025-09-01', 'highly_confidential'),
(3, 'TechVault Supplemental Production', 'completed', 'tiff', 7890, 'TVT', 4568, 12457, 'Lieff Cabraser LLP', '2025-10-15', 'confidential'),
(4, 'Pinnacle FDA Response - Clinical Data', 'delivered', 'pdf', 6789, 'PIN', 1, 6789, 'FDA Office of Regulatory Affairs', '2025-06-01', 'confidential'),
(4, 'Pinnacle FDA Response - Manufacturing', 'completed', 'native', 4321, 'PIN', 6790, 11110, 'FDA Office of Regulatory Affairs', '2025-07-15', 'confidential'),
(5, 'Baxter DOJ Production - Financial', 'delivered', 'pdf', 9012, 'BAX', 1, 9012, 'DOJ Criminal Division', '2025-08-01', 'confidential'),
(5, 'Baxter DOJ Production - Contracts', 'delivered', 'native', 3456, 'BAX', 9013, 12468, 'DOJ Criminal Division', '2025-09-15', 'attorneys_eyes_only'),
(5, 'Baxter DOJ Production - Communications', 'in_progress', 'tiff', 7890, 'BAX', 12469, 20358, 'DOJ Criminal Division', NULL, 'highly_confidential'),
(1, 'Meridian Clawback Production', 'pending', 'tiff', 567, 'MER-CL', 1, 567, 'Patterson & Holmes LLP', NULL, 'attorneys_eyes_only'),
(3, 'TechVault Regulatory Production - AG', 'pending', 'pdf', 2345, 'TVT-REG', 1, 2345, 'California Attorney General', NULL, 'confidential');

-- ============================================================
-- 10. SEARCH QUERIES (15 rows)
-- ============================================================
INSERT INTO search_queries (case_id, query_name, search_terms, query_type, results_count, created_by, date_range_start, date_range_end, file_types_filter, status) VALUES
(1, 'Algorithm IP Terms', 'proprietary AND (algorithm OR "neural network" OR "machine learning")', 'boolean', 4567, 'James Crawford', '2024-01-01', '2025-03-31', 'pdf,docx,pptx', 'executed'),
(1, 'Torres Departure Communications', '"last day" OR "new position" OR "Apex" OR "offer letter"', 'boolean', 2345, 'James Crawford', '2024-10-01', '2025-03-15', 'eml', 'executed'),
(1, 'Source Code Transfer', 'git clone OR download OR USB OR "external drive"', 'keyword', 1234, 'Emily Zhang', '2024-12-01', '2025-03-15', 'eml,csv,txt', 'executed'),
(2, 'Revenue Recognition Terms', '"revenue recognition" OR "ASC 606" OR "restatement" OR "adjustment"', 'boolean', 8901, 'James Crawford', '2024-06-01', '2024-12-31', 'pdf,docx,xlsx', 'executed'),
(2, 'Earnings Guidance Communications', '"earnings" W/5 "guidance" OR "forecast" OR "projection"', 'proximity', 3456, 'James Crawford', '2024-07-01', '2024-09-30', 'eml,docx', 'executed'),
(2, 'Whistleblower Terms', '"concern" OR "irregularity" OR "questionable" OR "uncomfortable"', 'keyword', 567, 'Emily Zhang', '2024-01-01', '2025-06-01', 'eml', 'executed'),
(3, 'Breach Indicator Terms', '"unauthorized access" OR "exfiltration" OR "anomalous" OR "compromise"', 'boolean', 12345, 'James Crawford', '2025-01-01', '2025-07-20', 'pdf,txt,csv,eml', 'executed'),
(3, 'PII Data References', '/\\b\\d{3}-\\d{2}-\\d{4}\\b/', 'regex', 45678, 'Emily Zhang', '2024-01-01', '2025-07-30', 'csv,xlsx,txt', 'executed'),
(4, 'Adverse Event Reports', '"adverse event" OR "SAE" OR "serious adverse" OR "death" OR "hospitalization"', 'boolean', 5678, 'James Crawford', '2023-01-01', '2025-04-10', 'pdf,docx', 'executed'),
(4, 'Protocol Deviation Terms', '"deviation" OR "non-compliance" OR "protocol violation" OR "GCP"', 'keyword', 3456, 'Emily Zhang', '2023-06-01', '2025-04-10', 'pdf,docx,xlsx', 'executed'),
(5, 'FCPA Red Flag Terms', '"government official" OR "gift" OR "entertainment" OR "facilitating payment"', 'boolean', 7890, 'James Crawford', '2023-01-01', '2025-05-22', 'eml,pdf,xlsx', 'executed'),
(5, 'Third Party Agent Payments', '"commission" OR "consulting fee" OR "retainer" W/10 ("agent" OR "consultant")', 'proximity', 4567, 'James Crawford', '2023-01-01', '2025-05-22', 'xlsx,pdf,eml', 'executed'),
(5, 'Indonesia Entity Names', '"PT Jaya" OR "Mandiri" OR "Sinar Mas" OR "Nusantara"', 'keyword', 2345, 'Emily Zhang', '2023-01-01', '2025-06-10', 'pdf,eml,docx', 'executed'),
(1, 'Non-Compete Violation Evidence', '"compete" OR "solicit" OR "confidential information" OR "trade secret"', 'boolean', 6789, 'James Crawford', '2024-06-01', '2025-04-01', 'pdf,eml,docx', 'executed'),
(3, 'Concept: Data Security Failures', 'data security failures and vulnerability exploitation', 'concept', 9012, 'James Crawford', '2024-06-01', '2025-07-30', 'pdf,docx,eml,txt', 'executed');

-- ============================================================
-- 11. PREDICTIVE CODING (15 rows)
-- ============================================================
INSERT INTO predictive_coding (case_id, model_name, description, status, accuracy, precision_score, recall_score, f1_score, training_docs, coded_docs, algorithm) VALUES
(1, 'Meridian Trade Secret Relevance v3', 'Model trained to identify documents relevant to trade secret misappropriation claims.', 'active', 0.9234, 0.8945, 0.9123, 0.9033, 5000, 156432, 'transformer'),
(1, 'Meridian Privilege Classifier v2', 'Model to identify attorney-client privileged communications in Meridian collection.', 'active', 0.9567, 0.9345, 0.9234, 0.9289, 3000, 43455, 'neural_network'),
(2, 'GlobalBank Fraud Indicator Model', 'Identifies documents containing indicators of securities fraud or financial manipulation.', 'active', 0.8901, 0.8765, 0.9012, 0.8887, 8000, 90690, 'transformer'),
(2, 'GlobalBank Revenue Relevance v1', 'Classifies documents by relevance to Q3 2024 revenue recognition issues.', 'completed', 0.9123, 0.8890, 0.9234, 0.9059, 6000, 90690, 'svm'),
(3, 'TechVault Breach Document Classifier', 'Identifies documents related to the March 2025 data breach incident.', 'active', 0.9456, 0.9234, 0.9345, 0.9289, 4000, 49134, 'transformer'),
(3, 'TechVault PII Detection Model', 'Detects documents containing personally identifiable information.', 'active', 0.9678, 0.9456, 0.9567, 0.9511, 2000, 49134, 'neural_network'),
(4, 'Pinnacle Clinical Relevance Model', 'Classifies clinical trial documents by regulatory relevance.', 'active', 0.8789, 0.8567, 0.8901, 0.8731, 7000, 113468, 'random_forest'),
(4, 'Pinnacle Adverse Event Detector', 'Identifies documents containing adverse event information.', 'completed', 0.9345, 0.9123, 0.9456, 0.9287, 3500, 113468, 'svm'),
(5, 'Baxter FCPA Red Flag Model v2', 'Identifies documents with FCPA red flags including bribery indicators.', 'active', 0.9012, 0.8890, 0.9123, 0.9005, 5500, 145801, 'transformer'),
(5, 'Baxter Payment Anomaly Classifier', 'Classifies financial transactions by anomaly risk level.', 'active', 0.8567, 0.8345, 0.8678, 0.8508, 4000, 56789, 'neural_network'),
(1, 'Meridian Hot Document Identifier', 'Identifies smoking gun documents in the trade secret matter.', 'completed', 0.8234, 0.7890, 0.8567, 0.8215, 2000, 156432, 'logistic_regression'),
(2, 'GlobalBank Insider Trading Screen', 'Screens for communications suggesting insider trading activity.', 'training', 0.7890, 0.7654, 0.8123, 0.7882, 10000, 45000, 'transformer'),
(3, 'TechVault Notification Scope Model', 'Identifies affected individuals for breach notification purposes.', 'completed', 0.9789, 0.9678, 0.9567, 0.9622, 1500, 15678, 'neural_network'),
(5, 'Baxter Entity Relationship Mapper', 'Maps relationships between entities in FCPA investigation.', 'training', 0.8123, 0.7901, 0.8234, 0.8064, 6000, 30000, 'random_forest'),
(1, 'Meridian Non-Compete Relevance', 'Classifies documents relevant to non-compete violation claims.', 'active', 0.8901, 0.8678, 0.9012, 0.8842, 3500, 43455, 'svm');

-- ============================================================
-- 12. PRIVILEGE LOGS (15 rows)
-- ============================================================
INSERT INTO privilege_logs (case_id, document_title, bates_number, privilege_type, basis, author, recipients, date_of_communication, status, reviewer) VALUES
(1, 'Email: Legal Strategy Discussion - Torres Matter', 'MER-00234', 'attorney_client', 'Communication between client and counsel seeking legal advice regarding employee departure and potential IP theft.', 'David Chen', 'James Crawford; Emily Zhang', '2025-03-16', 'logged', 'Emily Zhang'),
(1, 'Memo: Litigation Risk Assessment - Apex Competition', 'MER-00567', 'work_product', 'Attorney work product prepared in anticipation of litigation analyzing competitive threat from Apex Technologies.', 'James Crawford', 'David Chen; Karen Mitchell', '2025-03-18', 'logged', 'Emily Zhang'),
(1, 'Email: Re: Injunctive Relief Options', 'MER-00891', 'attorney_client', 'Attorney-client communication discussing potential TRO and preliminary injunction strategies.', 'James Crawford', 'David Chen', '2025-03-20', 'upheld', 'Emily Zhang'),
(2, 'Email: SEC Subpoena Response Strategy', 'GLB-01234', 'attorney_client', 'Communication between General Counsel and outside counsel regarding SEC subpoena compliance strategy.', 'Robert Kim', 'James Crawford', '2025-06-07', 'logged', 'Emily Zhang'),
(2, 'Memo: Potential Exposure Analysis - Securities Claims', 'GLB-02345', 'work_product', 'Attorney analysis of potential securities fraud exposure and defense strategies.', 'James Crawford', 'Robert Kim; Jennifer Walsh', '2025-06-12', 'logged', 'Emily Zhang'),
(2, 'Email: Board Advisor Consultation on Restatement', 'GLB-03456', 'attorney_client', 'Privileged communication between board advisor and counsel regarding earnings restatement implications.', 'Robert Kim', 'James Crawford; External Board Counsel', '2025-06-15', 'challenged', 'Emily Zhang'),
(3, 'Email: Breach Notification Legal Requirements', 'TVT-01234', 'attorney_client', 'Client seeking legal advice on state and federal breach notification obligations.', 'Carlos Rivera', 'James Crawford', '2025-07-23', 'logged', 'Emily Zhang'),
(3, 'Memo: Class Action Defense Strategy', 'TVT-02345', 'work_product', 'Attorney mental impressions and strategic analysis for defending data breach class action.', 'James Crawford', 'Maria Santos; Carlos Rivera', '2025-07-28', 'upheld', 'Emily Zhang'),
(3, 'Email: Joint Defense Group Communication - Vendor', 'TVT-03456', 'joint_defense', 'Communication among joint defense group members regarding shared vendor liability.', 'James Crawford', 'Vendor Counsel; Co-Defendant Counsel', '2025-08-05', 'logged', 'Emily Zhang'),
(4, 'Email: FDA Warning Letter Response Draft', 'PIN-01234', 'attorney_client', 'Attorney-client communication reviewing draft response to FDA warning letter.', 'Dr. Lisa Park', 'James Crawford; Regulatory Counsel', '2025-04-15', 'logged', 'Emily Zhang'),
(4, 'Memo: Regulatory Risk Assessment - PNX-401', 'PIN-02345', 'work_product', 'Attorney work product analyzing regulatory risks associated with PNX-401 clinical trial findings.', 'James Crawford', 'Dr. Lisa Park', '2025-04-20', 'logged', 'Emily Zhang'),
(5, 'Email: FCPA Investigation Scope Discussion', 'BAX-01234', 'attorney_client', 'Privileged communication between in-house counsel and outside counsel defining investigation scope.', 'David Nakamura', 'James Crawford', '2025-05-26', 'logged', 'Emily Zhang'),
(5, 'Memo: FCPA Voluntary Disclosure Analysis', 'BAX-02345', 'work_product', 'Attorney analysis of pros and cons of voluntary self-disclosure to DOJ.', 'James Crawford', 'David Nakamura; Angela Foster', '2025-06-01', 'upheld', 'Emily Zhang'),
(5, 'Email: Common Interest Agreement - Co-Investigation', 'BAX-03456', 'common_interest', 'Communication under common interest doctrine with co-investigating party counsel.', 'James Crawford', 'Co-Investigator Counsel; David Nakamura', '2025-06-10', 'logged', 'Emily Zhang'),
(1, 'Email: Settlement Demand Analysis', 'MER-01567', 'work_product', 'Attorney analysis of settlement demand received from opposing counsel with strategic recommendations.', 'James Crawford', 'David Chen; Sarah Mitchell', '2025-05-01', 'logged', 'Emily Zhang');

-- ============================================================
-- 13. TIMELINE EVENTS (15 rows)
-- ============================================================
INSERT INTO timeline_events (case_id, event_title, event_date, description, category, source_document, participants, significance, ai_generated) VALUES
(1, 'Torres Accepts Apex Technologies Offer', '2025-01-15', 'Michael Torres accepted a Senior Director position at Apex Technologies, direct competitor of Meridian.', 'incident', 'MER-00002', 'Michael Torres', 'high', FALSE),
(1, 'Large Git Repository Clone Detected', '2025-02-28', 'IT security logs show Torres cloned the entire algo-core repository at 11:45 PM, unusual for his role.', 'incident', 'MER-00003', 'Michael Torres', 'high', TRUE),
(1, 'Torres Last Day at Meridian', '2025-03-14', 'Michael Torres final day of employment. Exit interview conducted by HR Director Karen Mitchell.', 'meeting', 'MER-00004', 'Michael Torres; Karen Mitchell', 'high', FALSE),
(1, 'Litigation Hold Issued', '2025-03-20', 'Legal hold issued to all engineering department custodians and IT department.', 'discovery', NULL, 'James Crawford; Sarah Mitchell', 'high', FALSE),
(2, 'Q3 2024 Earnings Call', '2024-10-15', 'GlobalBank reported Q3 2024 earnings with $47M revenue subsequently restated.', 'communication', 'GLB-00001', 'Jennifer Walsh; CEO; Investors', 'high', FALSE),
(2, 'Internal Audit Flags Revenue Irregularity', '2024-11-20', 'Internal audit team identifies material weakness in revenue recognition for long-term service contracts.', 'incident', 'GLB-00003', 'Samantha Green; Jennifer Walsh', 'high', TRUE),
(2, 'SEC Formal Investigation Order', '2025-06-01', 'SEC issues formal order of investigation into GlobalBank earnings restatement.', 'filing', NULL, 'SEC; Robert Kim; James Crawford', 'high', FALSE),
(3, 'Anomalous Outbound Traffic Detected', '2025-03-12', 'SOC detected unusual data exfiltration patterns from production database server at 02:14 UTC.', 'incident', 'TVT-00001', 'Carlos Rivera; SOC Team', 'high', TRUE),
(3, 'Breach Publicly Disclosed', '2025-04-01', 'TechVault issues press release and SEC 8-K filing disclosing the data breach affecting 2.3M customers.', 'communication', NULL, 'CEO; Carlos Rivera; Maria Santos', 'high', FALSE),
(3, 'Class Action Filed', '2025-07-20', 'Consumer class action complaint filed in N.D. Cal. alleging negligent data security practices.', 'filing', NULL, 'Lieff Cabraser LLP; TechVault Inc.', 'high', FALSE),
(4, 'FDA Inspection of Manufacturing Facility', '2025-02-10', 'FDA conducted unannounced inspection of Pinnacle primary manufacturing facility in New Jersey.', 'meeting', NULL, 'FDA Inspectors; Thomas Wright', 'high', FALSE),
(4, 'FDA Form 483 Issued', '2025-02-14', 'FDA issues Form 483 citing three observations related to data integrity in batch records.', 'filing', 'PIN-00002', 'FDA; Thomas Wright; Dr. Lisa Park', 'high', FALSE),
(5, 'Suspicious Wire Transfer Pattern Identified', '2024-08-15', 'Compliance system flagged pattern of wire transfers to Indonesian consulting firms exceeding $50K thresholds.', 'transaction', 'BAX-00001', 'Angela Foster; Compliance Officer', 'high', TRUE),
(5, 'Anonymous Hotline Report Filed', '2025-01-10', 'Anonymous report received via ethics hotline alleging improper payments to government officials in Jakarta.', 'incident', NULL, 'Anonymous Reporter', 'high', FALSE),
(5, 'DOJ Issues Grand Jury Subpoena', '2025-05-22', 'DOJ Criminal Division issues grand jury subpoena for all APAC financial records and agent agreements.', 'filing', NULL, 'DOJ; David Nakamura; James Crawford', 'high', FALSE);

-- ============================================================
-- 14. EMAIL THREADS (15 rows)
-- ============================================================
INSERT INTO email_threads (case_id, thread_subject, participant_count, message_count, date_range, key_participants, has_attachments, sentiment, relevance_score, thread_summary) VALUES
(1, 'Re: Algo-Core Architecture Review Meeting', 8, 23, '2024-11-01 to 2025-02-15', 'Michael Torres; David Chen; Priya Patel', TRUE, 'neutral', 0.9234, 'Extended discussion of proprietary algorithm architecture including detailed technical specifications shared across team members. Torres actively participated and requested access to additional repositories.'),
(1, 'Re: Transition Plan - Torres Departure', 5, 12, '2025-02-01 to 2025-03-14', 'Michael Torres; Karen Mitchell; David Chen', TRUE, 'negative', 0.8901, 'HR-managed transition discussion. Torres was evasive about knowledge transfer and delayed handoff of critical documentation. Multiple follow-ups required.'),
(1, 'FW: Apex Technologies - Exciting Opportunity', 2, 4, '2025-01-10 to 2025-01-15', 'Michael Torres; External Recruiter', FALSE, 'positive', 0.9567, 'Recruiter outreach from Apex Technologies specifically mentioning interest in Torres ML expertise. Offer discussed with compensation details.'),
(2, 'Re: Q3 Revenue Adjustments - URGENT', 6, 18, '2024-09-15 to 2024-10-10', 'Jennifer Walsh; Marcus Thompson; Controller Team', TRUE, 'negative', 0.9678, 'Escalating discussion about Q3 revenue recognition adjustments. Walsh directed team to apply aggressive recognition methodology over Thompson objections.'),
(2, 'Re: Earnings Call Preparation - Q3 2024', 9, 31, '2024-10-01 to 2024-10-14', 'Jennifer Walsh; CEO; IR Team; Robert Kim', TRUE, 'neutral', 0.8567, 'Preparation materials for Q3 earnings call including talking points, anticipated analyst questions, and rehearsal notes.'),
(2, 'Re: External Auditor Concerns - Revenue', 4, 8, '2024-11-15 to 2024-12-20', 'Samantha Green; External Audit Partner; Jennifer Walsh', FALSE, 'negative', 0.9890, 'Auditor raising concerns about revenue recognition methodology. Internal discussion about how to respond to auditor inquiries.'),
(3, 'CRITICAL: Prod-DB-07 Anomalous Activity', 12, 45, '2025-03-12 to 2025-03-15', 'Carlos Rivera; SOC Team; CTO; External IR Firm', FALSE, 'negative', 0.9901, 'Real-time incident response thread documenting breach detection, containment, and initial forensic analysis. Critical timeline of events.'),
(3, 'Re: Customer Notification Requirements by State', 7, 15, '2025-03-20 to 2025-04-01', 'Maria Santos; James Crawford; Privacy Counsel', TRUE, 'neutral', 0.8234, 'Legal analysis of notification requirements across all 50 states and international jurisdictions for affected customers.'),
(3, 'Re: Third Party Forensics Engagement', 4, 9, '2025-03-14 to 2025-03-18', 'Carlos Rivera; CTO; Procurement; CrowdStrike', TRUE, 'neutral', 0.7890, 'Engagement of external forensics firm for independent breach investigation and evidence preservation.'),
(4, 'Re: PNX-401 Adverse Event Report - Patient 4521', 6, 14, '2024-09-10 to 2024-09-25', 'Dr. Lisa Park; Principal Investigator; Safety Team', TRUE, 'negative', 0.8901, 'Discussion of serious adverse event in Phase III trial. Debate about causality assessment and reporting timeline to FDA.'),
(4, 'Re: Manufacturing Deviation - Lot 2024-789', 5, 11, '2024-12-01 to 2024-12-15', 'Thomas Wright; QA Team; Production Manager', TRUE, 'negative', 0.8456, 'Investigation of manufacturing deviation in key batch. Root cause analysis and CAPA documentation discussed.'),
(5, 'Re: Jakarta Office Entertainment Budget Approval', 4, 7, '2024-06-10 to 2024-06-18', 'Raymond Tan; Angela Foster; Regional VP', FALSE, 'positive', 0.9345, 'Request for increased entertainment budget for government relations events in Jakarta. Approval given with minimal compliance review.'),
(5, 'Re: PT Jaya Mandiri Consulting Agreement Renewal', 5, 13, '2024-03-01 to 2024-04-15', 'David Nakamura; Raymond Tan; Angela Foster', TRUE, 'neutral', 0.9123, 'Renewal of consulting agreement with Indonesian third party. Discussion of expanded scope and 40% fee increase without clear justification.'),
(5, 'FW: Concerns About Agent Payments', 3, 6, '2025-01-05 to 2025-01-12', 'Anonymous; Ethics Hotline; Compliance Officer', FALSE, 'negative', 0.9789, 'Anonymous complaint forwarded from ethics hotline raising concerns about payments to agents in Indonesia and Malaysia.'),
(1, 'Re: Patent Filing - Predictive Analytics Engine', 4, 9, '2024-08-15 to 2024-09-30', 'David Chen; Patent Counsel; Michael Torres; Priya Patel', TRUE, 'positive', 0.8123, 'Discussion of provisional patent application for Meridian proprietary algorithm. Torres and Patel listed as co-inventors.');

-- ============================================================
-- 15. KEY TERMS (15 rows)
-- ============================================================
INSERT INTO key_terms (case_id, term, frequency, relevance_score, category, context_snippet, first_occurrence, last_occurrence, document_count) VALUES
(1, 'algo-core', 2345, 0.9678, 'concept', 'Torres cloned the algo-core repository containing proprietary neural network implementation...', '2024-06-15', '2025-03-14', 456),
(1, 'Michael Torres', 8901, 0.9890, 'person', 'Michael Torres, Senior Software Architect, resigned effective March 14, 2025...', '2024-01-15', '2025-04-01', 2345),
(1, 'Apex Technologies', 3456, 0.9567, 'organization', 'Apex Technologies is a direct competitor specializing in predictive analytics...', '2024-11-01', '2025-03-20', 890),
(2, 'revenue recognition', 5678, 0.9456, 'concept', 'Revenue recognition under ASC 606 for long-term service contracts requires...', '2024-07-01', '2025-06-15', 1234),
(2, 'restatement', 2345, 0.9789, 'concept', 'The Q3 2024 earnings restatement resulted in a $47M downward revenue adjustment...', '2024-10-20', '2025-06-10', 678),
(2, '$47 million', 890, 0.9234, 'financial', 'The $47 million variance between preliminary and restated Q3 revenue figures...', '2024-10-15', '2025-06-01', 345),
(3, 'prod-db-07', 4567, 0.9890, 'concept', 'Production database server prod-db-07 was the initial point of compromise...', '2025-03-12', '2025-07-30', 567),
(3, 'exfiltration', 1234, 0.9345, 'concept', 'Data exfiltration occurred over a 72-hour window through encrypted tunnel...', '2025-03-12', '2025-08-01', 234),
(3, '2.3 million customers', 678, 0.8901, 'financial', 'Approximately 2.3 million customer records were potentially exposed...', '2025-03-15', '2025-07-25', 189),
(4, 'PNX-401', 6789, 0.9567, 'concept', 'PNX-401 is the lead compound in the Phase III cardiovascular trial...', '2023-06-01', '2025-04-20', 2345),
(4, 'Form 483', 1234, 0.9123, 'concept', 'FDA Form 483 observations cited three findings related to data integrity...', '2025-02-14', '2025-04-15', 345),
(5, 'PT Jaya Mandiri', 3456, 0.9678, 'organization', 'PT Jaya Mandiri Consulting received $2.3M in consulting fees over 18 months...', '2023-03-01', '2025-06-10', 567),
(5, 'facilitating payment', 890, 0.9456, 'concept', 'Expense reports describe facilitating payments to government officials for permit approvals...', '2023-06-15', '2025-05-22', 234),
(5, 'Raymond Tan', 5678, 0.9234, 'person', 'Raymond Tan, Country Manager Indonesia, approved entertainment expenses for government officials...', '2023-01-15', '2025-06-20', 1890),
(1, 'non-compete agreement', 1567, 0.8890, 'concept', 'Torres executed a 24-month non-compete agreement upon hire restricting competitive employment...', '2022-03-01', '2025-04-01', 234);

-- ============================================================
-- 16. ANOMALY ALERTS (15 rows)
-- ============================================================
INSERT INTO anomaly_alerts (case_id, alert_title, description, severity, alert_type, detected_date, affected_custodian, affected_date_range, status, ai_confidence) VALUES
(1, 'Unusual After-Hours Repository Access', 'Michael Torres accessed algo-core repository 47 times between 11 PM and 3 AM in his final two weeks.', 'critical', 'unusual_access', '2025-03-01', 'Michael Torres', '2025-02-28 to 2025-03-14', 'investigating', 0.9567),
(1, 'Large Data Transfer to External Drive', 'USB mass storage device connected to Torres workstation with 34GB data transfer detected.', 'critical', 'pattern', '2025-03-10', 'Michael Torres', '2025-03-10', 'investigating', 0.9890),
(1, 'Email Forwarding Rule to Personal Account', 'Auto-forwarding rule discovered on Torres mailbox sending copies to personal Gmail account.', 'high', 'unusual_access', '2025-03-05', 'Michael Torres', '2025-01-15 to 2025-03-14', 'resolved', 0.9234),
(2, 'Data Gap in CFO Email Archive', '72-hour gap detected in Jennifer Walsh email archive during critical earnings period.', 'critical', 'data_gap', '2025-06-25', 'Jennifer Walsh', '2024-10-05 to 2024-10-08', 'investigating', 0.8901),
(2, 'Spike in File Deletions - Finance SharePoint', '1,247 files deleted from Finance SharePoint site two days before SEC investigation announced.', 'critical', 'deletion', '2025-06-28', 'Jennifer Walsh', '2025-05-30 to 2025-06-01', 'investigating', 0.9678),
(2, 'Unusual Bloomberg Terminal Activity', 'Anomalous trading desk communications volume spike 48 hours before earnings restatement announcement.', 'high', 'spike', '2025-07-01', 'Marcus Thompson', '2024-10-12 to 2024-10-14', 'investigating', 0.8456),
(3, 'Network Log Gap During Breach Window', 'Firewall logs missing for 4-hour window coinciding with initial breach detection.', 'critical', 'data_gap', '2025-08-02', 'Carlos Rivera', '2025-03-12 00:00 to 2025-03-12 04:00', 'investigating', 0.9456),
(3, 'Unusual Database Query Pattern', 'Automated queries extracting customer PII in bulk detected from application service account.', 'critical', 'pattern', '2025-07-28', 'Carlos Rivera', '2025-03-10 to 2025-03-12', 'resolved', 0.9789),
(3, 'Access Log Deletion Attempt', 'Attempted deletion of application access logs detected and prevented by WORM storage.', 'high', 'deletion', '2025-08-05', 'Carlos Rivera', '2025-03-13', 'resolved', 0.9123),
(4, 'Clinical Data Modification After Lock', 'Audit trail shows modifications to clinical database records after study database lock date.', 'critical', 'unusual_access', '2025-05-01', 'Dr. Lisa Park', '2024-12-15 to 2025-01-10', 'investigating', 0.8678),
(4, 'Batch Record Backdating Pattern', 'AI detected pattern suggesting batch record entries were backdated based on metadata analysis.', 'high', 'pattern', '2025-05-05', 'Thomas Wright', '2024-09-01 to 2024-12-31', 'investigating', 0.8234),
(5, 'Payment Structuring Below Reporting Threshold', 'Pattern of wire transfers structured just below $10K reporting threshold to Indonesian accounts.', 'critical', 'pattern', '2025-06-15', 'Angela Foster', '2023-06-01 to 2024-12-31', 'investigating', 0.9345),
(5, 'Weekend Wire Transfer Approvals', 'Multiple high-value wire transfers approved on weekends bypassing normal dual-approval workflow.', 'high', 'unusual_access', '2025-06-18', 'Raymond Tan', '2024-01-01 to 2024-12-31', 'investigating', 0.8890),
(5, 'Communication Gap with Agent', 'Three-month communication gap with PT Jaya Mandiri despite active payment schedule.', 'medium', 'data_gap', '2025-06-20', 'David Nakamura', '2024-04-01 to 2024-07-01', 'new', 0.7890),
(1, 'Patel Cloud Storage Sync Anomaly', 'Priya Patel synced 12GB of engineering files to personal Dropbox account one week before resignation.', 'high', 'unusual_access', '2025-03-08', 'Priya Patel', '2025-03-07 to 2025-03-08', 'investigating', 0.9012);

-- ============================================================
-- 17. COMPLIANCE RULES (15 rows)
-- ============================================================
INSERT INTO compliance_rules (rule_name, description, regulation, status, last_checked, violations_count, affected_cases, severity, automated, remediation_steps) VALUES
('FRCP Rule 37(e) Preservation', 'Ensure reasonable steps to preserve ESI relevant to litigation when duty to preserve attaches.', 'frcp', 'active', '2026-03-15 08:00:00', 0, 5, 'critical', TRUE, 'Issue litigation hold within 48 hours of trigger event. Suspend auto-deletion policies. Verify custodian acknowledgment.'),
('GDPR Article 17 Right to Erasure', 'Ensure EU data subject deletion requests are honored unless litigation hold applies.', 'gdpr', 'active', '2026-03-14 12:00:00', 2, 2, 'high', TRUE, 'Cross-reference deletion requests against active litigation holds. Document legal basis for retention. Respond within 30 days.'),
('HIPAA PHI Handling in Discovery', 'Protected health information must be redacted or handled per HIPAA guidelines during eDiscovery.', 'hipaa', 'active', '2026-03-15 09:00:00', 1, 1, 'critical', TRUE, 'Apply PHI detection model to all documents. Redact before production. Log all PHI access. Encrypt in transit and at rest.'),
('SOX Section 302 Document Retention', 'Financial records related to SOX compliance must be retained per regulatory requirements.', 'sox', 'active', '2026-03-14 14:00:00', 3, 2, 'critical', TRUE, 'Verify retention policies for financial records. Flag auto-deletion conflicts. Audit trail for all financial document access.'),
('FCPA Anti-Bribery Record Keeping', 'Books and records must accurately reflect all transactions and asset dispositions.', 'fcpa', 'active', '2026-03-15 10:00:00', 5, 1, 'critical', TRUE, 'Review all third-party agent payments. Verify business justification documentation. Flag payments exceeding thresholds.'),
('CCPA Consumer Data Disclosure', 'California consumers have the right to know what personal data is collected and how it is used.', 'ccpa', 'active', '2026-03-13 16:00:00', 1, 2, 'high', TRUE, 'Maintain data inventory. Respond to consumer requests within 45 days. Verify data sale opt-out mechanisms.'),
('SEC Regulation FD Fair Disclosure', 'Material nonpublic information must be disclosed to all investors simultaneously.', 'sec', 'active', '2026-03-14 11:00:00', 0, 1, 'high', TRUE, 'Monitor pre-earnings communications. Flag selective disclosure patterns. Review IR department communications.'),
('FRCP Rule 26(b) Proportionality', 'Discovery scope must be proportional to the needs of the case considering burden and expense.', 'frcp', 'active', '2026-03-15 07:00:00', 0, 5, 'medium', FALSE, 'Document cost-benefit analysis for each collection. Track processing costs per custodian. Report disproportionate requests.'),
('GDPR Article 46 Cross-Border Transfer', 'Personal data transfers outside EEA require appropriate safeguards.', 'gdpr', 'active', '2026-03-12 10:00:00', 1, 3, 'high', TRUE, 'Verify Standard Contractual Clauses in place. Document transfer impact assessments. Use approved encryption methods.'),
('HIPAA Minimum Necessary Standard', 'Only the minimum necessary PHI should be disclosed for discovery purposes.', 'hipaa', 'active', '2026-03-15 08:30:00', 0, 1, 'high', TRUE, 'Apply minimum necessary filters to all HIPAA-regulated productions. Document scope limitations. Train reviewers.'),
('SOX Section 802 Document Destruction', 'Prohibition on destruction of corporate audit records and imposition of criminal penalties.', 'sox', 'active', '2026-03-14 15:00:00', 0, 2, 'critical', TRUE, 'Monitor document deletion attempts for financial records. Alert on bulk deletions. Maintain immutable audit trail.'),
('FCPA Books and Records Accuracy', 'Companies must maintain accurate books, records, and accounts in reasonable detail.', 'fcpa', 'active', '2026-03-15 10:30:00', 3, 1, 'high', TRUE, 'Reconcile payment records against supporting documentation. Flag discrepancies. Verify dual-approval workflows.'),
('CCPA Data Breach Notification', 'California businesses must notify consumers of data breaches involving unencrypted personal information.', 'ccpa', 'active', '2026-03-13 17:00:00', 0, 1, 'high', TRUE, 'Monitor for data breach indicators. Maintain notification templates. Track 72-hour reporting window.'),
('SEC Rule 17a-4 Record Retention', 'Broker-dealers must preserve certain records for specified periods in accessible format.', 'sec', 'active', '2026-03-14 13:00:00', 2, 1, 'medium', TRUE, 'Verify WORM compliance for broker-dealer communications. Audit retention schedules. Test retrieval capability.'),
('FRCP Rule 34 ESI Production Format', 'Producing party must produce ESI in the form requested or in reasonably usable form.', 'frcp', 'active', '2026-03-15 07:30:00', 0, 4, 'medium', FALSE, 'Negotiate production format early. Document format agreements. Validate production specifications before delivery.');

-- ============================================================
-- 18. DATA SOURCES (15 rows)
-- ============================================================
INSERT INTO data_sources (case_id, source_name, source_type, connection_status, custodian, total_items, total_size_gb, last_synced, credentials_stored, collection_priority) VALUES
(1, 'Meridian Exchange Online', 'exchange', 'connected', 'Michael Torres', 34521, 12.40, '2025-04-05 14:30:00', TRUE, 'high'),
(1, 'Meridian OneDrive for Business', 'onedrive', 'connected', 'Michael Torres', 8934, 45.70, '2025-04-05 16:00:00', TRUE, 'high'),
(1, 'Meridian Engineering Slack', 'slack', 'connected', 'David Chen', 234567, 18.90, '2025-04-07 10:00:00', TRUE, 'medium'),
(2, 'GlobalBank Exchange Online', 'exchange', 'connected', 'Jennifer Walsh', 67234, 28.50, '2025-06-18 12:00:00', TRUE, 'high'),
(2, 'GlobalBank Finance SharePoint', 'sharepoint', 'connected', 'Jennifer Walsh', 23456, 34.20, '2025-06-19 09:00:00', TRUE, 'high'),
(2, 'GlobalBank Teams - Executive Channel', 'teams', 'connected', 'Robert Kim', 12890, 2.10, '2025-06-20 11:00:00', TRUE, 'high'),
(3, 'TechVault Exchange Online', 'exchange', 'connected', 'Carlos Rivera', 45678, 15.60, '2025-07-28 08:00:00', TRUE, 'high'),
(3, 'TechVault Google Workspace', 'google_workspace', 'connected', 'Maria Santos', 18234, 22.40, '2025-07-29 14:00:00', TRUE, 'medium'),
(3, 'TechVault Internal Slack', 'slack', 'connected', 'Carlos Rivera', 345678, 24.50, '2025-07-28 10:00:00', TRUE, 'high'),
(4, 'Pinnacle Exchange Online', 'exchange', 'connected', 'Dr. Lisa Park', 56789, 19.80, '2025-04-25 12:00:00', TRUE, 'medium'),
(4, 'Pinnacle Box Clinical Repository', 'box', 'connected', 'Dr. Lisa Park', 78901, 42.30, '2025-04-25 14:00:00', TRUE, 'high'),
(4, 'Pinnacle QA Local Server', 'local_server', 'connected', 'Thomas Wright', 34567, 67.80, '2025-04-26 08:00:00', TRUE, 'medium'),
(5, 'Baxter Exchange Online - APAC', 'exchange', 'connected', 'Raymond Tan', 89012, 31.20, '2025-06-09 10:00:00', TRUE, 'high'),
(5, 'Baxter SAP Financial System', 'salesforce', 'error', 'Angela Foster', 56789, 23.40, '2025-06-08 16:00:00', TRUE, 'high'),
(5, 'Baxter Asia SharePoint', 'sharepoint', 'connected', 'David Nakamura', 23456, 15.60, '2025-06-10 09:00:00', TRUE, 'medium');
