export const JOB_REPOSITORY = 'IJobRepository';

export interface CreateJobData {
  url: string;
  concurrency: number;
  status: string;
  startedAt: Date;
}

export interface UpdateJobData {
  id: number;
  status: string;
}

export interface IJobRepository {
  findJobById(id: number): Promise<CreateJobData | null>;
  create(data: CreateJobData): Promise<CreateJobData>;
  update(id: number, data: UpdateJobData): Promise<CreateJobData>;
  delete(id: number): Promise<void>;
}
