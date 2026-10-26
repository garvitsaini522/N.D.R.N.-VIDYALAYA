import { getDbStatus } from '../config/db.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { config } from '../config/env.js';

/**
 * Health check controller
 * Checks API server and MongoDB database connection status
 */
export async function getHealth(req, res) {
  const dbStatus = getDbStatus();
  const uptimeSeconds = Math.floor(process.uptime());

  const healthData = {
    server: {
      status: 'healthy',
      uptime: `${uptimeSeconds}s`,
      environment: config.env,
      timestamp: new Date().toISOString(),
      school: config.school.name,
      location: `${config.school.village}, ${config.school.town}, ${config.school.state}`,
    },
    database: {
      name: 'MongoDB',
      status: dbStatus.status,
      isConnected: dbStatus.isConnected,
      readyState: dbStatus.readyState,
      databaseName: dbStatus.database,
      host: dbStatus.host,
    },
    memory: {
      heapUsedMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      heapTotalMb: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      rssMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
    },
  };

  const isHealthy = dbStatus.isConnected;
  const message = isHealthy
    ? 'N.D.R.N. Vidyalaya Backend API is operational and connected to MongoDB'
    : `N.D.R.N. Vidyalaya Backend API is operational (Database state: ${dbStatus.status})`;

  return ApiResponse.success(res, healthData, message, isHealthy ? 200 : 200);
}
