import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CrawlerService } from './crawler.service';
import { HttpFetcherService } from './http-fetcher.service';
import { LinkExtractorService } from './link-extractor.service';
import { HTTP_FETCHER } from './interfaces/http-fetcher.interface';
import { LINK_EXTRACTOR } from './interfaces/link-extractor.interface';
import { CRAWLER_REPOSITORY } from './repository/crawler.repository.interface';
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
    { provide: HTTP_FETCHER, useClass: HttpFetcherService },
    { provide: LINK_EXTRACTOR, useClass: LinkExtractorService },
    { provide: CRAWLER_REPOSITORY, useClass: MongoCrawlerRepository },
  ],
  exports: [CrawlerService],
})
export class CrawlerModule {}
