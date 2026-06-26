import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const response = isHttpException ? exception.getResponse() : 'Server Error';
    const isError = exception instanceof Error;

    const message = typeof response === 'string' ? response : (response as { message?: string | string[] }).message ?? 'Server Error';

    this.logger.error(
      `${request.method} ${request.url} -> ${status}`,
      isError ? exception.stack : undefined,
      isError ? exception.constructor.name : 'UnknownException',
    );

    if (!isHttpException && isError) {
      this.logger.error(exception.message);
    }

    reply.status(status).send({
      success: false,
      statusCode: status,
      path: request.url,
      timestamp: new Date().toISOString(),
      message,
    });
  }
}
