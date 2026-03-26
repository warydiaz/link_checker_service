import {
  JobData,
  UpdateJobData,
} from 'src/job/repository/job.repository.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job, JobDocument } from '../job/job.schema';
import {
  BrokenLinkData,
  ICrawlerRepository,
} from 'src/crawler/repository/crawler.repository.interface';
import { BrokenLink } from './broken-link';

export class MongoCrawlerRepository implements ICrawlerRepository {
  constructor(
    @InjectModel(Job.name) private readonly jobModel: Model<Job>,
    @InjectModel(BrokenLink.name)
    private readonly brokenLinkModel: Model<BrokenLink>,
  ) {}

  private toJobData(doc: JobDocument): JobData {
    return {
      _id: doc._id.toString(),
      url: doc.url,
      concurrency: doc.concurrency,
      status: doc.status,
      startedAt: doc.startedAt,
    };
  }

  async update(_id: string, _data: UpdateJobData): Promise<JobData> {
    const doc = await this.jobModel.findByIdAndUpdate(_id, _data, {
      new: true,
    });
    if (!doc) throw new Error('Job not found');
    return this.toJobData(doc);
  }

  async registerBrokenLink(brokenLinkData: BrokenLinkData): Promise<void> {
    const brokenLink = new this.brokenLinkModel(brokenLinkData);
    await brokenLink.save();
  }
}
