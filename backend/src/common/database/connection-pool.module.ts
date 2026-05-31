import { Module } from '@nestjs/common';
import { ConnectionPoolService } from './connection-pool.config';
import { ConnectionRetryService } from './connection-retry.service';
import { ConnectionPoolController } from './connection-pool.controller';

@Module({
  controllers: [ConnectionPoolController],
  providers: [ConnectionPoolService, ConnectionRetryService],
  exports: [ConnectionPoolService, ConnectionRetryService],
})
export class ConnectionPoolModule {}
