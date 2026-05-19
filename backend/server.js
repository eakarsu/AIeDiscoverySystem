const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const pool = require('./db/pool');

const app = express();

// Security headers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS configuration (configurable via env: CORS_ORIGINS=https://a.com,https://b.com)
const corsOriginsEnv = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
app.use(cors({
  origin: corsOriginsEnv.includes('*') ? true : corsOriginsEnv,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parser middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'ok',
      timestamp: result.rows[0].now,
      uptime: process.uptime(),
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Database connection failed' });
  }
});

// Import route files
const authRoutes = require('./routes/auth');
const casesRoutes = require('./routes/cases');
const documentsRoutes = require('./routes/documents');
const legalHoldsRoutes = require('./routes/legalHolds');
const custodiansRoutes = require('./routes/custodians');
const collectionsRoutes = require('./routes/collections');
const processingRoutes = require('./routes/processing');
const reviewSetsRoutes = require('./routes/reviewSets');
const productionsRoutes = require('./routes/productions');
const searchQueriesRoutes = require('./routes/searchQueries');
const predictiveCodingRoutes = require('./routes/predictiveCoding');
const privilegeLogsRoutes = require('./routes/privilegeLogs');
const timelineEventsRoutes = require('./routes/timelineEvents');
const emailThreadsRoutes = require('./routes/emailThreads');
const keyTermsRoutes = require('./routes/keyTerms');
const anomalyAlertsRoutes = require('./routes/anomalyAlerts');
const complianceRulesRoutes = require('./routes/complianceRules');
const dataSourcesRoutes = require('./routes/dataSources');
const aiRoutes = require('./routes/ai');
const aiExtraRoutes = require('./routes/aiExtra');
const documentUploadRoutes = require('./routes/documentUpload');
const tarRoutes = require('./routes/tar');
const privilegeLogExportRoutes = require('./routes/privilegeLogExport');
const emailThreadAnalysisRoutes = require('./routes/emailThreadAnalysis');

// Mount route files
app.use('/api/auth', authRoutes);
app.use('/api/cases', casesRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/legal-holds', legalHoldsRoutes);
app.use('/api/custodians', custodiansRoutes);
app.use('/api/collections', collectionsRoutes);
app.use('/api/processing-jobs', processingRoutes);
app.use('/api/review-sets', reviewSetsRoutes);
app.use('/api/productions', productionsRoutes);
app.use('/api/search-queries', searchQueriesRoutes);
app.use('/api/predictive-coding', predictiveCodingRoutes);
app.use('/api/privilege-logs', privilegeLogsRoutes);
app.use('/api/timeline-events', timelineEventsRoutes);
app.use('/api/email-threads', emailThreadsRoutes);
app.use('/api/key-terms', keyTermsRoutes);
app.use('/api/anomaly-alerts', anomalyAlertsRoutes);
app.use('/api/compliance-rules', complianceRulesRoutes);
app.use('/api/data-sources', dataSourcesRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/ai-extra', aiExtraRoutes);
app.use('/api/document-upload', documentUploadRoutes);
app.use('/api/tar', tarRoutes);
app.use('/api/privilege-log-export', privilegeLogExportRoutes);
app.use('/api/email-thread-analysis', emailThreadAnalysisRoutes);
app.use('/api/agentic-discovery', require('./routes/agenticDiscovery'));
app.use('/api/deposition-video', require('./routes/depositionVideoSync'));
app.use('/api/court-format-export', require('./routes/courtFormatExport'));
app.use('/api/predictive-coding-feedback', require('./routes/predictiveCodingFeedback'));
app.use('/api/cost-projection', require('./routes/costProjection'));
app.use('/api/custodian-portal', require('./routes/custodianPortal'));
app.use('/api/chain-of-custody', require('./routes/chainOfCustody'));

// Custom Views (4 endpoints: VIZ + NON-VIZ) - MUST be mounted BEFORE 404 handler
app.use('/api/custom-views', require('./routes/customViews'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);

  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body too large' });
  }

  if (err.name === 'SyntaxError' && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error',
  });
});

// Start server
const PORT = process.env.BACKEND_PORT || 3001;

const startServer = async () => {
  try {
    // Test database connection
    const result = await pool.query('SELECT NOW()');
    console.log('Database connected successfully at:', result.rows[0].now);

    
// === Batch 03 Gaps & Frontend Mounts ===
try {
  const _batch03 = require('./routes/batch03Gaps');
  if (typeof authenticateToken === 'function') app.use('/api', authenticateToken, _batch03);
  else app.use('/api', _batch03);
} catch (_e) { /* batch03 gap routes optional */ }

app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('Failed to connect to database:', err.message);
    console.log(`Starting server on port ${PORT} without database verification...`);
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (database connection pending)`);
    });
  }
};

startServer();

module.exports = app;
