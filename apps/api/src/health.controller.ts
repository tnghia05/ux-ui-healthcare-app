import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Connection } from 'mongoose';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}
  @Get('live')
  @ApiOperation({summary:'Process liveness; does not assert database readiness'})
  live() { return {status:'ok'}; }
  @Get('ready')
  @ApiResponse({status:503,description:'Database unavailable'})
  async ready() {
    if (this.connection.readyState !== 1 || !this.connection.db) throw new ServiceUnavailableException();
    try { const hello = await this.connection.db.admin().command({hello:1}); if (!hello.isWritablePrimary) throw new ServiceUnavailableException(); } catch { throw new ServiceUnavailableException(); }
    return {status:'ok', database:'connected'};
  }
}
