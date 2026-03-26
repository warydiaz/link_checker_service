import { Injectable, Inject } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { CrawlerService } from 'src/crawler/crawler.service';
import {
  IJobRepository,
  JOB_REPOSITORY,
  JobData,
} from './repository/job.repository.interface';

@Injectable()
export class JobsService {
  constructor(
    @Inject(JOB_REPOSITORY) private readonly jobRepository: IJobRepository,
    private readonly crawlerService: CrawlerService,
  ) {}

  DEFAULT_CONCURRENCY = 2;
  RUNNING_STATUS = 'running';

  async createJob(createJobDto: CreateJobDto): Promise<JobData> {
    const job = await this.jobRepository.create({
      url: createJobDto.url,
      concurrency: createJobDto.concurrency ?? this.DEFAULT_CONCURRENCY,
      status: this.RUNNING_STATUS,
      startedAt: new Date(),
    });

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.crawlerService.startCrawl(
      job._id,
      createJobDto.url,
      createJobDto.concurrency!,
    );

    return job; // El controller ya puede responder 202
  }
}
