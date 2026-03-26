import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  BrokenLinkData,
  ICrawlerRepository,
} from 'src/crawler/repository/crawler.repository.interface';
import { BrokenLink } from './broken-link';

export class MongoCrawlerRepository implements ICrawlerRepository {
  constructor(
    @InjectModel(BrokenLink.name)
    private readonly brokenLinkModel: Model<BrokenLink>,
  ) {}

  async registerBrokenLink(brokenLinkData: BrokenLinkData): Promise<void> {
    const brokenLink = new this.brokenLinkModel(brokenLinkData);
    await brokenLink.save();
  }
}
