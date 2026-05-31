import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

/**
 * Pool size guidelines:
 *   Production : max = (num_cpu_cores * 2) + 1 capped at 30, min = max/4
 *   Staging    : max = 10, min = 2
 *   Test       : max = 5, min = 1 (keeps CI fast)
 *   Development: max = 5, min = 2
 */
function getOptimalPoolSize(env: string): { max: number; min: number } {
  switch (env) {
    case 'production':
      return { max: 20, min: 5 };
    case 'staging':
      return { max: 10, min: 2 };
    case 'test':
      return { max: 5, min: 1 };
    default:
      return { max: 5, min: 2 };
  }
}

export function getTypeOrmConfig(
  configService: ConfigService,
): TypeOrmModuleOptions {
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const isProduction = nodeEnv === 'production';
  const defaults = getOptimalPoolSize(nodeEnv);

  const poolMax = configService.get<number>('DATABASE_POOL_MAX', defaults.max);
  const poolMin = configService.get<number>('DATABASE_POOL_MIN', defaults.min);

  // Idle timeout: production keeps connections longer to avoid reconnect cost
  const idleTimeout = configService.get<number>(
    'DATABASE_IDLE_TIMEOUT',
    isProduction ? 60000 : 30000,
  );

  // Connection acquisition timeout: fail fast if pool exhausted
  const connectionTimeout = configService.get<number>(
    'DATABASE_CONNECTION_TIMEOUT',
    isProduction ? 5000 : 2000,
  );

  // Statement timeout: kill runaway queries
  const statementTimeout = configService.get<number>(
    'DATABASE_STATEMENT_TIMEOUT',
    isProduction ? 30000 : 15000,
  );

  return {
    type: 'postgres',
    host: configService.get<string>('DATABASE_HOST', 'localhost'),
    port: configService.get<number>('DATABASE_PORT', 5432),
    username: configService.get<string>('DATABASE_USER', 'postgres'),
    password: configService.get<string>('DATABASE_PASSWORD', 'postgres'),
    database: configService.get<string>('DATABASE_NAME', 'nestera'),
    entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../../migrations/*{.ts,.js}'],
    synchronize: !isProduction,
    logging: !isProduction
      ? ['error', 'warn', 'query']
      : ['error'],
    maxQueryExecutionTime: configService.get<number>(
      'DB_SLOW_QUERY_THRESHOLD',
      500,
    ),
    extra: {
      // Pool sizing
      max: poolMax,
      min: poolMin,

      // Connection lifecycle
      idleTimeoutMillis: idleTimeout,
      connectionTimeoutMillis: connectionTimeout,

      // Query protection
      statement_timeout: statementTimeout,
      query_timeout: statementTimeout,

      // Keep-alive to detect dead connections early
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,

      // Application name for pg_stat_activity visibility
      application_name: `nestera_${nodeEnv}`,

      // Allow recovery from full pool by queuing at most this many requests
      maxWaitingClients: Math.ceil(poolMax * 0.5),

      // Validate connections before checkout to discard stale ones
      testOnBorrow: true,
    },
  };
}
