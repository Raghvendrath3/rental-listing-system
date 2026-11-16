export type HealthStatus = 'ok' | 'degraded' | 'down';
export type HealthClientStatus = HealthStatus | 'unreachable' | 'loading';

export interface HealthUptime {
  seconds: number;
  human: string;
}

export interface HealthService {
  name: string;
  version: string;
  environment: string;
  commit: string | null;
}

export interface DatabaseHealthCheck {
  status: 'up' | 'down';
  latencyMs: number;
  pool: {
    total: number;
    idle: number;
    waiting: number;
  };
  error?: string;
}

export interface HealthSystem {
  memory: {
    rssMb: number;
    heapUsedMb: number;
    heapTotalMb: number;
  };
  nodeVersion: string;
}

export interface HealthResponse {
  status: HealthStatus;
  timestamp: string;
  uptime: HealthUptime;
  service?: HealthService;
  checks?: {
    database: DatabaseHealthCheck;
  };
  system?: HealthSystem;
}

export interface HealthHistoryEntry {
  checkedAt: string;
  status: HealthClientStatus;
  latencyMs: number | null;
}
