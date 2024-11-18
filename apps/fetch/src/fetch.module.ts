import { Module } from '@nestjs/common';
import { FetchController } from './fetch.controller';
import { FetchService } from './fetch.service';
import { FetchDataService } from './fetch-data.service';
import { Filing10QService } from './filing10q.service';
import { DatabaseModule } from '@app/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    DatabaseModule,
    ClientsModule.register([
      {
        name: 'RABBIT_MQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL], // RabbitMQ URL
          queue: 'filings_queue', // The queue to communicate with
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [FetchController],
  providers: [FetchService, FetchDataService, Filing10QService],
})
export class FetchModule {}
