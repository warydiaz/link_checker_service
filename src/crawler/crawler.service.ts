import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CONCURRENCY_LIMITER_FACTORY,
  IConcurrencyLimiterFactory,
} from './interfaces/concurrency-limiter.interface';
import {
  HTTP_FETCHER,
  IHttpFetcher,
} from './interfaces/http-fetcher.interface';
import {
  ILinkExtractor,
  LINK_EXTRACTOR,
} from './interfaces/link-extractor.interface';
import {
  CRAWLER_REPOSITORY,
  ICrawlerRepository,
} from './repository/crawler.repository.interface';
import { ICrawlerService } from './interfaces/crawler-service.interface';
import {
  DOMAIN_FILTER,
  IDomainFilter,
} from './interfaces/domain-filter.interface';

interface QueueItem {
  url: string;
  sourceUrl: string;
}

@Injectable()
export class CrawlerService implements ICrawlerService {
  private readonly logger = new Logger(CrawlerService.name);

  constructor(
    private readonly configService: ConfigService,
    @Inject(CONCURRENCY_LIMITER_FACTORY)
    private readonly limiterFactory: IConcurrencyLimiterFactory,
    @Inject(HTTP_FETCHER) private readonly httpFetcher: IHttpFetcher,
    @Inject(LINK_EXTRACTOR) private readonly linkExtractor: ILinkExtractor,
    @Inject(CRAWLER_REPOSITORY) private readonly repository: ICrawlerRepository,
    @Inject(DOMAIN_FILTER) private readonly domainFilter: IDomainFilter,
  ) {}

  async startCrawl(
    jobId: string,
    seedUrl: string,
    concurrency: number,
  ): Promise<void> {
    this.logger.log(
      `Job ${jobId} started — seed: ${seedUrl}, concurrency: ${concurrency}`,
    );

    const visited = new Set<string>([seedUrl]);
    const queue: QueueItem[] = [{ url: seedUrl, sourceUrl: seedUrl }];
    const limiter = this.limiterFactory.create(concurrency);
    const maxUrls = this.configService.get<number>('MAX_URLS_PER_JOB', 5000);
    const activeTasks = new Set<Promise<void>>();

    const processUrl = (url: string, sourceUrl: string): Promise<void> => {
      const task = limiter.run(async () => {
        const { html, statusCode, responseTimeMs, error } =
          await this.httpFetcher.fetch(url);

        if (error) {
          this.repository
            .registerBrokenLink({
              jobId,
              url,
              sourceUrl,
              statusCode,
              errorType: error.type,
              errorMessage: error.message,
              responseTimeMs,
            })
            .catch((err: unknown) => {
              this.logger.error(
                `Failed to register broken link for ${url}: ${String(err)}`,
              );
            });

          return;
        }

        if (!html) return;

        const links = this.linkExtractor.extractLinks(html, url);

        for (const link of links) {
          if (visited.size >= maxUrls) break;
          if (
            !visited.has(link) &&
            this.domainFilter.isAllowed(link, seedUrl)
          ) {
            visited.add(link);
            queue.push({ url: link, sourceUrl: url });
          }
        }
      });

      void task.finally(() => activeTasks.delete(task));
      activeTasks.add(task);
      return task;
    };

    while (queue.length > 0 || activeTasks.size > 0) {
      while (queue.length > 0 && limiter.activeCount < concurrency) {
        const { url, sourceUrl } = queue.shift()!;
        processUrl(url, sourceUrl);
      }

      if (activeTasks.size > 0) {
        await Promise.race(activeTasks);
      }
    }

    this.logger.log(`Job ${jobId} finished — ${visited.size} URLs visited`);
  }

  async getBrokenLinksByJobId(jobId: string) {
    return await this.repository.getBrokenLinksByJobId(jobId);
  }
}
