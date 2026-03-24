import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Job extends Document {
  @Prop() id: number;
  @Prop() url: string;
  @Prop() concurrency: number;
  @Prop() status: string;
  @Prop() startedAt: Date;
}

export const JobSchema = SchemaFactory.createForClass(Job);
