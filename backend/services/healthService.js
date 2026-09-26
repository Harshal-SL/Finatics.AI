const { bankingDb, appDb } = require('../config/supabase');

/**
 * Health & Keep-Alive Service
 * Performs active read requests to both Supabase databases
 * (Application DB and Banking DB) to prevent inactivity shutdown on Supabase free tier.
 */

let lastPollInfo = {
  lastPolledAt: null,
  pollCount: 0,
  lastStatus: 'INITIALIZING',
  details: null
};

/**
 * Perform a real read request on both databases
 * Resets Supabase's 7-day inactivity pause timer
 */
const checkDatabaseHealth = async () => {
  const timestamp = new Date().toISOString();
  const results = {
    timestamp,
    applicationDb: { status: 'unknown', latencyMs: null, error: null },
    bankingDb: { status: 'unknown', latencyMs: null, error: null }
  };

  // 1. Read query on Application DB (appDb)
  try {
    const startApp = Date.now();
    // Query users table with limit 1 to generate legitimate database activity
    const { data, error } = await appDb
      .from('users')
      .select('user_id')
      .limit(1);

    results.applicationDb.latencyMs = Date.now() - startApp;

    if (error) {
      results.applicationDb.status = 'error';
      results.applicationDb.error = error.message;
    } else {
      results.applicationDb.status = 'healthy';
      results.applicationDb.table = 'users';
      results.applicationDb.action = 'read_limit_1';
      results.applicationDb.rowsFound = data?.length || 0;
    }
  } catch (err) {
    results.applicationDb.status = 'error';
    results.applicationDb.error = err.message;
  }

  // 2. Read query on Banking DB (bankingDb)
  try {
    const startBanking = Date.now();
    // Query bank_accounts table with limit 1 to generate legitimate database activity
    const { data, error } = await bankingDb
      .from('bank_accounts')
      .select('account_id')
      .limit(1);

    results.bankingDb.latencyMs = Date.now() - startBanking;

    if (error) {
      results.bankingDb.status = 'error';
      results.bankingDb.error = error.message;
    } else {
      results.bankingDb.status = 'healthy';
      results.bankingDb.table = 'bank_accounts';
      results.bankingDb.action = 'read_limit_1';
      results.bankingDb.rowsFound = data?.length || 0;
    }
  } catch (err) {
    results.bankingDb.status = 'error';
    results.bankingDb.error = err.message;
  }

  const isHealthy =
    results.applicationDb.status === 'healthy' &&
    results.bankingDb.status === 'healthy';

  lastPollInfo = {
    lastPolledAt: timestamp,
    pollCount: lastPollInfo.pollCount + 1,
    lastStatus: isHealthy ? 'HEALTHY' : 'DEGRADED',
    details: results
  };

  return {
    status: isHealthy ? 'OK' : 'DEGRADED',
    timestamp,
    databases: results,
    keepAlive: {
      interval: 'Every 4 days',
      pollCount: lastPollInfo.pollCount,
      lastPolledAt: lastPollInfo.lastPolledAt,
      nextScheduledPoll: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString()
    }
  };
};

/**
 * Start the background polling timer (every 4 days)
 * @param {number} intervalDays - Interval between poll requests in days (default: 4)
 */
const startKeepAliveScheduler = (intervalDays = 4) => {
  const intervalMs = intervalDays * 24 * 60 * 60 * 1000;
  console.log(`[Supabase Keep-Alive] Initializing background database polling every ${intervalDays} days...`);

  // Initial poll 10 seconds after server startup to wake databases up immediately
  setTimeout(async () => {
    console.log('[Supabase Keep-Alive] Running initial startup health check on databases...');
    try {
      const res = await checkDatabaseHealth();
      console.log(
        `[Supabase Keep-Alive] Initial poll status: ${res.status}. Application DB: ${res.databases.applicationDb.status} (${res.databases.applicationDb.latencyMs}ms), Banking DB: ${res.databases.bankingDb.status} (${res.databases.bankingDb.latencyMs}ms)`
      );
    } catch (e) {
      console.error('[Supabase Keep-Alive] Initial poll failed:', e.message);
    }
  }, 10000);

  // Recurring poll every 4 days
  const timer = setInterval(async () => {
    console.log(`[Supabase Keep-Alive] Running scheduled 4-day database poll...`);
    try {
      const res = await checkDatabaseHealth();
      console.log(
        `[Supabase Keep-Alive] Scheduled poll completed: ${res.status}. App DB: ${res.databases.applicationDb.status}, Banking DB: ${res.databases.bankingDb.status}`
      );
    } catch (e) {
      console.error('[Supabase Keep-Alive] Scheduled poll failed:', e.message);
    }
  }, intervalMs);

  if (timer.unref) {
    timer.unref();
  }
};

module.exports = {
  checkDatabaseHealth,
  startKeepAliveScheduler,
  getLastPollInfo: () => lastPollInfo
};
