export const JOB_REPOSITORY = 'IJobRepository';

export interface CreateJobData {
  url: string;
  concurrency: number;
  status: string;
  startedAt: Date;
}

export interface JobData extends CreateJobData {
  _id: string;
}

export interface UpdateJobData {
  _id: string;
  status: string;
}

export interface IJobRepository {
  findJobById(id: string): Promise<JobData | null>;
  create(data: CreateJobData): Promise<JobData>;
  update(id: string, data: UpdateJobData): Promise<JobData>;
  delete(id: string): Promise<void>;
}
