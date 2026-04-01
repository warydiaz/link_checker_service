import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JobsController } from './job.controller';
import { JobsService } from './job.service';
import { JOB_REPOSITORY } from './repository/job.repository.interface';
import { MongoJobRepository } from 'src/infrastructure/job/mongo-job.repository';
import { Job, JobSchema } from 'src/infrastructure/job/job.schema';
import { CrawlerModule } from 'src/crawler/crawler.module';
import { BullModule } from '@nestjs/bull';
import { BullJobQueue } from 'src/infrastructure/job/bull-job.queue';
import { JOB_QUEUE } from './queue/job-queue.interface';
import { CrawlProcessor } from 'src/infrastructure/job/crawl.processor';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Job.name, schema: JobSchema }]),
    CrawlerModule,
    BullModule.registerQueue({ name: 'crawl' }),
  ],
  controllers: [JobsController],
  providers: [
    JobsService,
    { provide: JOB_REPOSITORY, useClass: MongoJobRepository },
    { provide: JOB_QUEUE, useClass: BullJobQueue },
    CrawlProcessor,
  ],
})
export class JobsModule {}
