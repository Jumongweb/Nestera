import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

export interface PoolMetrics {
  activeConnections: number;
  idleConnections: number;
  waitingRequests: number;
  totalConnections: number;
  utilizationPercentage: number;
  maxPoolSize: number;
  minPoolSize: number;
  timestamp: Date;
}

export interface PoolHealthStatus {
  healthy: boolean;
  utilizationPercentage: number;
  waitingRequests: number;
  latencyMs: number;
  message: string;
}

@Injectable()
export class ConnectionPoolService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ConnectionPoolService.name);
  private metrics: PoolMetrics[] = [];
  private readonly maxMetricsHistory = 1000;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private acquisitionTimes: number[] = [];
  private readonly maxAcquisitionSamples = 500;

  constructor(
    private configService: ConfigService,
    private dataSource: DataSource,
  ) {}

  onModuleInit() {
    this.initializePoolMonitoring();
    this.logPoolConfiguration();
  }

  onModuleDestroy() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  private logPoolConfiguration() {
    const pool = this.getPool();
    if (!pool) return;

    this.logger.log('Database connection pool initialized', {
      max: pool.options?.max,
      min: pool.options?.min,
      idleTimeoutMillis: pool.options?.idleTimeoutMillis,
      connectionTimeoutMillis: pool.options?.connectionTimeoutMillis,
    });
  }

  private initializePoolMonitoring() {
    const intervalMs = parseInt(
      this.configService.get<string>('DB_POOL_MONITOR_INTERVAL') || '30000',
      10,
    );

    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
      this.checkPoolHealth();
    }, intervalMs);
  }

  private getPool(): any {
    return (this.dataSource.driver as any).pool;
  }

  private collectMetrics() {
    try {
      const pool = this.getPool();
      if (!pool) return;

      const maxPoolSize = this.configService.get<number>('DATABASE_POOL_MAX', 20);
      const minPoolSize = this.configService.get<number>('DATABASE_POOL_MIN', 2);

      const activeConnections =
        pool._activeConnections?.length ??
        pool.totalCount - pool.idleCount ??
        0;
      const idleConnections =
        pool._idleConnections?.length ?? pool.idleCount ?? 0;
      const waitingRequests =
        pool._waitingRequests?.length ?? pool.waitingCount ?? 0;
      const totalConnections =
        pool._allConnections?.length ?? pool.totalCount ?? activeConnections + idleConnections;

      const metrics: PoolMetrics = {
        activeConnections,
        idleConnections,
        waitingRequests,
        totalConnections,
        utilizationPercentage:
          totalConnections > 0 ? (activeConnections / maxPoolSize) * 100 : 0,
        maxPoolSize,
        minPoolSize,
        timestamp: new Date(),
      };

      this.metrics.push(metrics);
      if (this.metrics.length > this.maxMetricsHistory) {
        this.metrics.shift();
      }

      if (metrics.utilizationPercentage > 80) {
        this.logger.warn(
          `High connection pool utilization: ${metrics.utilizationPercentage.toFixed(2)}% (${activeConnections}/${maxPoolSize})`,
        );
      }

      if (waitingRequests > 5) {
        this.logger.warn(
          `Connection pool queue building: ${waitingRequests} requests waiting`,
        );
      }
    } catch (error) {
      this.logger.error('Failed to collect pool metrics', error);
    }
  }

  private async checkPoolHealth(): Promise<void> {
    const start = Date.now();
    try {
      await this.dataSource.query('SELECT 1');
      const latencyMs = Date.now() - start;

      this.acquisitionTimes.push(latencyMs);
      if (this.acquisitionTimes.length > this.maxAcquisitionSamples) {
        this.acquisitionTimes.shift();
      }

      if (latencyMs > 500) {
        this.logger.warn(`Slow DB health check: ${latencyMs}ms`);
      }
    } catch (error) {
      this.logger.error('Pool health check failed', error);
    }
  }

  getMetrics(): PoolMetrics[] {
    return this.metrics;
  }

  getLatestMetrics(): PoolMetrics | null {
    return this.metrics.length > 0
      ? this.metrics[this.metrics.length - 1]
      : null;
  }

  getAverageUtilization(minutes = 5): number {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    const recentMetrics = this.metrics.filter((m) => m.timestamp > cutoff);
    if (recentMetrics.length === 0) return 0;
    return (
      recentMetrics.reduce((acc, m) => acc + m.utilizationPercentage, 0) /
      recentMetrics.length
    );
  }

  async checkPoolHealth_(): Promise<boolean> {
    try {
      const result = await this.dataSource.query('SELECT 1');
      return !!result;
    } catch {
      return false;
    }
  }

  async getHealthStatus(): Promise<PoolHealthStatus> {
    const start = Date.now();
    const healthy = await this.checkPoolHealth_();
    const latencyMs = Date.now() - start;
    const latest = this.getLatestMetrics();

    return {
      healthy,
      utilizationPercentage: latest?.utilizationPercentage ?? 0,
      waitingRequests: latest?.waitingRequests ?? 0,
      latencyMs,
      message: healthy
        ? `Pool healthy, ${latencyMs}ms latency`
        : 'Pool unhealthy - connection check failed',
    };
  }

  async detectConnectionLeaks(): Promise<number> {
    const pool = this.getPool();
    if (!pool) return 0;

    const activeConnections = pool._activeConnections?.length ?? 0;
    const maxPoolSize = this.configService.get<number>('DATABASE_POOL_MAX', 20);

    if (activeConnections > maxPoolSize * 0.9) {
      this.logger.warn(
        `Potential connection leak: ${activeConnections}/${maxPoolSize} connections active`,
      );
    }

    return activeConnections;
  }

  getConnectionAcquisitionStats() {
    const times = this.acquisitionTimes;
    if (times.length === 0) {
      return { samples: 0, avgMs: 0, p95Ms: 0, p99Ms: 0, maxMs: 0 };
    }

    const sorted = [...times].sort((a, b) => a - b);
    return {
      samples: times.length,
      avgMs: times.reduce((a, b) => a + b, 0) / times.length,
      p95Ms: sorted[Math.floor(sorted.length * 0.95)] || 0,
      p99Ms: sorted[Math.floor(sorted.length * 0.99)] || 0,
      maxMs: sorted[sorted.length - 1] || 0,
    };
  }

  getPoolSummary() {
    const latest = this.getLatestMetrics();
    const avgUtil5m = this.getAverageUtilization(5);
    const avgUtil30m = this.getAverageUtilization(30);

    return {
      current: latest,
      averageUtilization: { last5Minutes: avgUtil5m, last30Minutes: avgUtil30m },
      acquisitionLatency: this.getConnectionAcquisitionStats(),
      metricsCollected: this.metrics.length,
    };
  }
}
