import { Controller, HttpCode, HttpStatus, Query, Post } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { JobsService } from './job.service';

@Controller('jobs')
export class JobsController {
  constructor(private jobService: JobsService) {}
  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  async createJob(@Query() createJobDto: CreateJobDto) {
    return await this.jobService.createJob(createJobDto);
  }
}
