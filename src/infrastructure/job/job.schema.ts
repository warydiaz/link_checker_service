import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type JobDocument = HydratedDocument<Job>;

@Schema()
export class Job {
  @Prop() url: string;
  @Prop() concurrency: number;
  @Prop() status: string;
  @Prop() startedAt: Date;
}

export const JobSchema = SchemaFactory.createForClass(Job);

JobSchema.set('toJSON', {
  versionKey: false,
});

JobSchema.set('toObject', {
  versionKey: false,
});
