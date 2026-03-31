import {
  Controller,
  HttpCode,
  HttpStatus,
  Query,
  Post,
  Get,
  Param,
} from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { JobsService } from './job.service';
import { PaginationDto } from './dto/pagination.dto';

@Controller('jobs')
export class JobsController {
  constructor(private jobService: JobsService) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  async createJob(@Query() createJobDto: CreateJobDto) {
    return await this.jobService.createJob(createJobDto);
  }

  @Get(':id')
  async getJob(@Param('id') id: string) {
    return await this.jobService.getJob(id);
  }

  @Get(':id/errors')
  async getJobErrors(@Param('id') id: string) {
    return await this.jobService.getJobErrors(id);
  }

  @Get()
  async getAllJobs(@Query() paginationDto: PaginationDto) {
    return await this.jobService.getAllJobs(paginationDto);
  }
}
