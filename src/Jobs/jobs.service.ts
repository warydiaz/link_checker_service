import { Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';

@Injectable()
export class JobsService {
  async createJob(createJobDto: CreateJobDto) {
    console.log('Creating job with URL:', createJobDto.url);
    console.log('Concurrency level:', createJobDto.concurrency);
    // Here you would add logic to create a job, e.g., save it to a database or enqueue it for processing
    return { message: 'Job created successfully' };
  }
}
