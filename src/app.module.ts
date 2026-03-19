import { Module } from '@nestjs/common';
import { JobsModule } from './Jobs/jobs.module';

@Module({
  imports: [JobsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
