import {
  CreateJobData,
  IJobRepository,
  UpdateJobData,
} from 'src/job/repository/job.repository.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job } from './job.schema';

export class MongoJobRepository implements IJobRepository {
  constructor(@InjectModel(Job.name) private readonly jobModel: Model<Job>) {}

  async findJobById(_id: number): Promise<CreateJobData | null> {
    return await this.jobModel.findById(_id).exec();
  }

  async create(_data: CreateJobData): Promise<CreateJobData> {
    const job = new this.jobModel(_data);
    return await job.save();
  }

  async update(_id: number, _data: UpdateJobData): Promise<CreateJobData> {
    const job = await this.jobModel.findByIdAndUpdate(_id, _data, {
      new: true,
    });
    if (!job) {
      throw new Error('Job not found');
    }
    return job;
  }

  async delete(_id: number): Promise<void> {
    const result = await this.jobModel.findByIdAndDelete(_id);
    if (!result) {
      throw new Error('Job not found');
    }
  }
}
