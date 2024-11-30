// sse.controller.ts
import {
  Controller,
  Post,
  Req,
  Res,
  Body,
  // UseGuards,
  UsePipes,
  ValidationPipe,
  Logger,
  OnModuleDestroy,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { EventPattern, Payload } from '@nestjs/microservices';
// import { AuthGuard } from './auth.guard'; // Assume you have an AuthGuard implemented
import { SseRequestDto } from './dto/sse-request.dto';
import { SseMessageDto } from './dto/sse-message.dto';

@Controller()
export class SseController implements OnModuleDestroy {
  private readonly logger = new Logger(SseController.name);
  private responses: Map<string, Response[]> = new Map();

  // @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('sse')
  sse(
    @Req() request: Request,
    @Res() response: Response,
    @Body() body: SseRequestDto,
  ) {
    const userId = body.user_id;

    if (!userId) {
      this.logger.warn('Missing user_id in request');
      response.status(400).send('Missing user_id');
      return;
    }

    this.logger.log(`Received SSE request for user_id: ${userId}`);

    // Set headers for SSE
    response.setHeader('Cache-Control', 'no-cache, no-transform');
    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Connection', 'keep-alive');
    response.flushHeaders();

    // Handle client disconnects
    request.on('close', () => {
      this.logger.log(`Client with user_id ${userId} disconnected`);
      this.removeClientResponse(userId, response);
      response.end();
    });

    // Store response for sending messages
    this.addClientResponse(userId, response);

    // Optionally, send a welcome message
    response.write(
      JSON.stringify({
        message: {},
        metadata: {
          type: 'connected',
        },
      }),
    );
  }

  private addClientResponse(userId: string, response: Response) {
    const userResponses = this.responses.get(userId) || [];
    userResponses.push(response);
    this.responses.set(userId, userResponses);
  }

  private removeClientResponse(userId: string, response: Response) {
    const userResponses = this.responses.get(userId);
    if (userResponses) {
      const index = userResponses.indexOf(response);
      if (index !== -1) {
        userResponses.splice(index, 1);
      }
      if (userResponses.length === 0) {
        this.responses.delete(userId);
      } else {
        this.responses.set(userId, userResponses);
      }
    }
  }

  // @UsePipes(new ValidationPipe({ transform: true }))
  @EventPattern('api_sse_user_sse_message')
  async handleSseMessage(@Payload() data: SseMessageDto) {
    const { metadata } = data;
    const userResponses = this.responses.get(metadata.userId);

    if (userResponses) {
      userResponses.forEach((response) => {
        response.write(JSON.stringify(data));
      });
    } else {
      this.logger.warn(`No active connections for user_id: ${metadata.userId}`);
    }
  }

  onModuleDestroy() {
    // Graceful shutdown: Close all SSE connections
    this.responses.forEach((responses) => {
      responses.forEach((response) => {
        response.write(
          JSON.stringify({
            message: {},
            metadata: {
              type: 'shutting_down',
            },
          }),
        );
        response.end();
      });
    });
    this.responses.clear();
    this.logger.log('All SSE connections closed due to server shutdown');
  }
}
