import { Injectable, Inject } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { CrawlerService } from 'src/crawler/crawler.service';
import {
  IJobRepository,
  JOB_REPOSITORY,
} from './repository/job.repository.interface';

@Injectable()
export class JobsService {
  constructor(
    @Inject(JOB_REPOSITORY) private readonly jobRepository: IJobRepository,
    private readonly crawlerService: CrawlerService,
  ) {}

  DEFAULT_CONCURRENCY = 2;
  async createJob(createJobDto: CreateJobDto) {
    const job = await this.jobRepository.create({
      url: createJobDto.url,
      concurrency: createJobDto.concurrency ?? this.DEFAULT_CONCURRENCY,
      status: 'running',
      startedAt: new Date(),
    });

    // Sin await — el crawling corre en background
    /* this.crawlerService.startCrawl(
      job._id,
      createJobDto.url,
      createJobDto.concurrency,
    );*/

    return job; // El controller ya puede responder 202
  }
}
