import { PaginationDto } from '../dto/pagination.dto';

export const JOB_REPOSITORY = 'IJobRepository';

export interface CreateJobData {
  url: string;
  concurrency: number;
  status: string;
  startedAt: Date;
  finishedAt?: Date;
}

export interface JobData extends CreateJobData {
  _id: string;
}

export interface UpdateJobData {
  _id: string;
  status: string;
  finishedAt: Date;
}

export interface IJobRepository {
  findJobById(id: string): Promise<JobData | null>;
  create(data: CreateJobData): Promise<JobData>;
  update(id: string, data: UpdateJobData): Promise<JobData>;
  listJobs(pagination: PaginationDto): Promise<JobData[]>;
}
