import {
  JobData,
  UpdateJobData,
} from 'src/job/repository/job.repository.interface';

export const CRAWLER_REPOSITORY = 'ICrawlerRepository';

export interface BrokenLinkData {
  jobId: string;
  url: string;
  sourceUrl: string;
  statusCode: number | null;
  errorType: 'HTTP_ERROR' | 'TIMEOUT' | 'CONNECTION_ERROR';
  errorMessage: string;
  responseTimeMs: number;
}

export interface ICrawlerRepository {
  update(id: string, data: UpdateJobData): Promise<JobData>;
  registerBrokenLink(brokenLinkData: BrokenLinkData): Promise<void>;
}
