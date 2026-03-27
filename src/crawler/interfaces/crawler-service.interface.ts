import { BrokenLinkData } from '../repository/crawler.repository.interface';

export const CRAWLER_SERVICE = Symbol('ICrawlerService');

export interface ICrawlerService {
  startCrawl(
    jobId: string,
    seedUrl: string,
    concurrency: number,
  ): Promise<void>;
  getBrokenLinksByJobId(jobId: string): Promise<BrokenLinkData[]>;
}
