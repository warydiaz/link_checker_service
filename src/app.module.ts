import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JobsModule } from './job/job.module';
import { CrawlerModule } from './crawler/crawler.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JobsModule,
    CrawlerModule,
    DatabaseModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
