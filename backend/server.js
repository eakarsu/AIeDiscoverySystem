const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { validateRuntime } = require('./governance/runtime');
validateRuntime();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const auth = require('./middleware/auth');
const { createProviderGate } = require('./governance/providerGate');

const app = express();
const port = Number(process.env.BACKEND_PORT || 3001);
const origins = String(process.env.CORS_ORIGINS || 'http://localhost:5101')
  .split(',').map((value) => value.trim()).filter(Boolean);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'same-site' }, contentSecurityPolicy: false }));
app.use(cors({ origin(origin, callback) {
  if (!origin || origins.includes(origin)) return callback(null, true);
  return callback(new Error('Origin is not allowed by CORS.'));
}, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'AIeDiscoverySystem', timestamp: new Date().toISOString() }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/governance', require('./governance/router'));

app.use('/api', auth);
const providerPrefixes = ['/api/cases','/api/documents','/api/legal-holds','/api/custodians','/api/collections','/api/processing-jobs','/api/review-sets','/api/productions','/api/search-queries','/api/predictive-coding','/api/privilege-logs','/api/timeline-events','/api/email-threads','/api/key-terms','/api/anomaly-alerts','/api/compliance-rules','/api/data-sources','/api/ai','/api/document-upload','/api/tar','/api/agentic-discovery','/api/custom-views','/api/privilege-clawback-risk'];
app.use(createProviderGate(providerPrefixes));
if (process.env.ENABLE_LEGACY_PROVIDER_ROUTES === 'true' && process.env.NODE_ENV !== 'production') {
  const routes = [
    ['/api/cases','./routes/cases'],['/api/documents','./routes/documents'],
    ['/api/legal-holds','./routes/legalHolds'],['/api/custodians','./routes/custodians'],
    ['/api/collections','./routes/collections'],['/api/processing-jobs','./routes/processing'],
    ['/api/review-sets','./routes/reviewSets'],['/api/productions','./routes/productions'],
    ['/api/search-queries','./routes/searchQueries'],['/api/predictive-coding','./routes/predictiveCoding'],
    ['/api/privilege-logs','./routes/privilegeLogs'],['/api/timeline-events','./routes/timelineEvents'],
    ['/api/email-threads','./routes/emailThreads'],['/api/key-terms','./routes/keyTerms'],
    ['/api/anomaly-alerts','./routes/anomalyAlerts'],['/api/compliance-rules','./routes/complianceRules'],
    ['/api/data-sources','./routes/dataSources'],['/api/ai','./routes/ai'],
    ['/api/ai-extra','./routes/aiExtra'],['/api/document-upload','./routes/documentUpload'],
    ['/api/tar','./routes/tar'],['/api/privilege-log-export','./routes/privilegeLogExport'],
    ['/api/email-thread-analysis','./routes/emailThreadAnalysis'],['/api/agentic-discovery','./routes/agenticDiscovery'],
    ['/api/deposition-video','./routes/depositionVideoSync'],['/api/court-format-export','./routes/courtFormatExport'],
    ['/api/predictive-coding-feedback','./routes/predictiveCodingFeedback'],['/api/cost-projection','./routes/costProjection'],
    ['/api/custodian-portal','./routes/custodianPortal'],['/api/chain-of-custody','./routes/chainOfCustody'],
    ['/api/custom-views','./routes/customViews'],['/api/privilege-clawback-risk','./routes/privilegeClawbackRisk'],
    ['/api','./routes/enterpriseModules'],['/api','./routes/batch03Gaps']
  ];
  for (const [mount, modulePath] of routes) app.use(mount, require(modulePath));
}

app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((error, _req, res, _next) => res.status(error.status || 500).json({ error: error.status ? error.message : 'Internal server error' }));

function start() {
  return app.listen(port, () => console.log(`eDiscovery API listening on ${port}`));
}
if (require.main === module) start();
module.exports = { app, start };
