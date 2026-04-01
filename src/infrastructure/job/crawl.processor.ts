import { Processor, Process } from '@nestjs/bull';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bull';
import {
  CRAWLER_SERVICE,
  ICrawlerService,
} from 'src/crawler/interfaces/crawler-service.interface';
import {
  IJobRepository,
  JOB_REPOSITORY,
} from 'src/job/repository/job.repository.interface';

interface CrawlJobData {
  jobId: string;
  url: string;
  concurrency: number;
}

@Processor('crawl')
export class CrawlProcessor {
  private readonly logger = new Logger(CrawlProcessor.name);

  constructor(
    @Inject(CRAWLER_SERVICE) private readonly crawlerService: ICrawlerService,
    @Inject(JOB_REPOSITORY) private readonly jobRepository: IJobRepository,
  ) {}

  @Process()
  async process(job: Job<CrawlJobData>): Promise<void> {
    const { jobId, url, concurrency } = job.data;

    try {
      await this.crawlerService.startCrawl(jobId, url, concurrency);
      await this.jobRepository.update(jobId, {
        _id: jobId,
        status: 'completed',
        finishedAt: new Date(),
      });
    } catch (err: unknown) {
      this.logger.error(`Job ${jobId} failed: ${String(err)}`);
      await this.jobRepository.update(jobId, {
        _id: jobId,
        status: 'failed',
        finishedAt: new Date(),
      });
    }
  }
}
