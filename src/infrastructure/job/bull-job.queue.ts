import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { IJobQueue } from 'src/job/queue/job-queue.interface';

@Injectable()
export class BullJobQueue implements IJobQueue {
  constructor(@InjectQueue('crawl') private readonly jobQueue: Queue) {}

  async add(data: {
    jobId: string;
    url: string;
    concurrency: number;
  }): Promise<void> {
    await this.jobQueue.add(data);
  }
}
