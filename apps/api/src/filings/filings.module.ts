import { Module } from '@nestjs/common';
import { FilingsController } from '@/api/src/filings/fiings.controller';
import { FilingsService } from '@/api/src/filings/filings.service';
import { DatabaseModule } from '@app/common/database/database.module';
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
  controllers: [FilingsController],
  providers: [FilingsService],
})
export class FilingsModule {}
