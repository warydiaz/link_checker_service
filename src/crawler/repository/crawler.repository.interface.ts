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
  registerBrokenLink(brokenLinkData: BrokenLinkData): Promise<void>;
}
