import { Catch, HttpException, ValidationPipe } from '@nestjs/common';
import type { ArgumentsHost, ExceptionFilter, INestApplication } from '@nestjs/common';
import type { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const status = error instanceof HttpException ? error.getStatus() : 500;
    const body = error instanceof HttpException ? error.getResponse() : null;
    const details = typeof body === 'object' && body && 'message' in body ? body.message : null;
    response.status(status).json({error:{code: status === 400 ? 'VALIDATION_ERROR' : status === 503 ? 'SERVICE_UNAVAILABLE' : status === 404 ? 'NOT_FOUND' : status === 401 ? 'UNAUTHORIZED' : status === 429 ? 'RATE_LIMITED' : 'REQUEST_FAILED', message:status >= 500 ? 'Dịch vụ tạm thời không khả dụng' : typeof details === 'string' ? details : 'Yêu cầu không hợp lệ', ...(Array.isArray(details) ? {details} : {})}, requestId:response.getHeader('x-request-id')});
  }
}
export function configureHttp(app: INestApplication, origins: string[]) {
  app.setGlobalPrefix('api/v1');
  app.enableCors({origin:origins});
  app.use((_request: Request, response: Response, next: () => void) => {response.setHeader('x-request-id',randomUUID()); next();});
  app.useGlobalPipes(new ValidationPipe({whitelist:true, forbidNonWhitelisted:true, transform:true}));
  app.useGlobalFilters(new ApiExceptionFilter());
}
