import {
  CreateJobData,
  IJobRepository,
  JobData,
  UpdateJobData,
} from 'src/job/repository/job.repository.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job, JobDocument } from './job.schema';

export class MongoJobRepository implements IJobRepository {
  constructor(@InjectModel(Job.name) private readonly jobModel: Model<Job>) {}

  private toJobData(doc: JobDocument): JobData {
    return {
      _id: doc._id.toString(),
      url: doc.url,
      concurrency: doc.concurrency,
      status: doc.status,
      startedAt: doc.startedAt,
    };
  }

  async findJobById(_id: string): Promise<JobData | null> {
    const doc = await this.jobModel.findById(_id).exec();
    return doc ? this.toJobData(doc) : null;
  }

  async create(_data: CreateJobData): Promise<JobData> {
    const doc = await new this.jobModel(_data).save();
    return this.toJobData(doc);
  }

  async update(_id: string, _data: UpdateJobData): Promise<JobData> {
    const doc = await this.jobModel.findByIdAndUpdate(_id, _data, {
      new: true,
    });
    if (!doc) throw new Error('Job not found');
    return this.toJobData(doc);
  }

  async delete(_id: string): Promise<void> {
    const result = await this.jobModel.findByIdAndDelete(_id);
    if (!result) throw new Error('Job not found');
  }
}
