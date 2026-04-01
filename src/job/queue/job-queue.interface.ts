export const JOB_QUEUE = 'JOB_QUEUE';

export interface IJobQueue {
  add(data: { jobId: string; url: string; concurrency: number }): Promise<void>;
}
