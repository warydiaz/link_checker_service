import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { JobsService } from './jobs.service';

@Controller('jobs')
export class JobsController {
  constructor(private jobService: JobsService) {}
  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  async createJob(@Body() createJobDto: CreateJobDto) {
    console.log('Received job creation request:', createJobDto);
    return { jobId: '123', status: 'running', startedAt: new Date() };
  }
}
