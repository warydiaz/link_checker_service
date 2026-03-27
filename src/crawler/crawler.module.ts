import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CrawlerService } from './crawler.service';
import { HttpFetcherService } from './http-fetcher.service';
import { LinkExtractorService } from './link-extractor.service';
import { CONCURRENCY_LIMITER_FACTORY } from './interfaces/concurrency-limiter.interface';
import { CRAWLER_SERVICE } from './interfaces/crawler-service.interface';
import { DOMAIN_FILTER } from './interfaces/domain-filter.interface';
import { HTTP_FETCHER } from './interfaces/http-fetcher.interface';
import { LINK_EXTRACTOR } from './interfaces/link-extractor.interface';
import { SameDomainFilter } from './same-domain-filter.service';
import { CRAWLER_REPOSITORY } from './repository/crawler.repository.interface';
import { PLimitConcurrencyLimiterFactory } from 'src/infrastructure/crawler/p-limit-concurrency-limiter.factory';
import { MongoCrawlerRepository } from 'src/infrastructure/crawler/mongo-crawler.repository';
import {
  BrokenLink,
  BrokenLinkSchema,
} from 'src/infrastructure/crawler/broken-link';
import { Job, JobSchema } from 'src/infrastructure/job/job.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Job.name, schema: JobSchema },
      { name: BrokenLink.name, schema: BrokenLinkSchema },
    ]),
  ],
  providers: [
    CrawlerService,
    { provide: CRAWLER_SERVICE, useClass: CrawlerService },
    { provide: CONCURRENCY_LIMITER_FACTORY, useClass: PLimitConcurrencyLimiterFactory },
    { provide: HTTP_FETCHER, useClass: HttpFetcherService },
    { provide: LINK_EXTRACTOR, useClass: LinkExtractorService },
    { provide: CRAWLER_REPOSITORY, useClass: MongoCrawlerRepository },
    { provide: DOMAIN_FILTER, useClass: SameDomainFilter },
  ],
  exports: [CRAWLER_SERVICE],
})
export class CrawlerModule {}
