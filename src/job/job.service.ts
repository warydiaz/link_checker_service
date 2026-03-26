import { Injectable, Inject, Logger } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { CrawlerService } from 'src/crawler/crawler.service';
import {
  IJobRepository,
  JOB_REPOSITORY,
  JobData,
} from './repository/job.repository.interface';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    @Inject(JOB_REPOSITORY) private readonly jobRepository: IJobRepository,
    private readonly crawlerService: CrawlerService,
  ) {}

  DEFAULT_CONCURRENCY = 2;

  async createJob(createJobDto: CreateJobDto): Promise<JobData> {
    const job = await this.jobRepository.create({
      url: createJobDto.url,
      concurrency: createJobDto.concurrency ?? this.DEFAULT_CONCURRENCY,
      status: 'running',
      startedAt: new Date(),
    });

    this.runCrawl(job._id, createJobDto.url, job.concurrency);

    return job;
  }

  private runCrawl(jobId: string, seedUrl: string, concurrency: number): void {
    this.crawlerService
      .startCrawl(jobId, seedUrl, concurrency)
      .then(() => {
        return this.jobRepository.update(jobId, {
          _id: jobId,
          status: 'completed',
          finishedAt: new Date(),
        });
      })
      .catch((err: unknown) => {
        this.logger.error(`Job ${jobId} failed: ${String(err)}`);
        return this.jobRepository.update(jobId, {
          _id: jobId,
          status: 'failed',
          finishedAt: new Date(),
        });
      });
  }
}
