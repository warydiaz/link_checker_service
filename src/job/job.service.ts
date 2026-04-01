import { Injectable, Inject, Logger } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import {
  CRAWLER_SERVICE,
  ICrawlerService,
} from 'src/crawler/interfaces/crawler-service.interface';
import {
  IJobRepository,
  JOB_REPOSITORY,
  JobData,
} from './repository/job.repository.interface';
import { PaginationDto } from './dto/pagination.dto';
import { BrokenLinkData } from 'src/crawler/repository/crawler.repository.interface';
import { JobError } from './error';
import { IJobQueue, JOB_QUEUE } from './queue/job-queue.interface';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    @Inject(JOB_REPOSITORY) private readonly jobRepository: IJobRepository,
    @Inject(CRAWLER_SERVICE) private readonly crawlerService: ICrawlerService,
    @Inject(JOB_QUEUE) private readonly jobQueue: IJobQueue,
  ) {}

  #DEFAULT_CONCURRENCY = 2;

  async createJob(createJobDto: CreateJobDto): Promise<JobData> {
    const job = await this.jobRepository.create({
      url: createJobDto.url,
      concurrency: createJobDto.concurrency ?? this.#DEFAULT_CONCURRENCY,
      status: 'running',
      startedAt: new Date(),
    });

    await this.jobQueue.add({
      jobId: job._id,
      url: createJobDto.url,
      concurrency: job.concurrency,
    });

    return job;
  }

  async getJob(id: string): Promise<JobData> {
    const job = await this.jobRepository.findJobById(id);
    if (!job) throw JobError.JobNotFound();
    return job;
  }

  async getJobErrors(id: string): Promise<BrokenLinkData[]> {
    const job = await this.jobRepository.findJobById(id);

    if (!job) {
      throw JobError.JobNotFound();
    }

    return await this.crawlerService.getBrokenLinksByJobId(id);
  }

  async getAllJobs(paginationDto: PaginationDto): Promise<JobData[]> {
    return await this.jobRepository.listJobs(paginationDto);
  }
}
