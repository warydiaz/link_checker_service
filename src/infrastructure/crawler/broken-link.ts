import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class BrokenLink {
  @Prop({ required: true }) jobId: string;
  @Prop({ required: true }) url: string;
  @Prop({ required: true }) sourceUrl: string;
  @Prop({ type: Number, default: null }) statusCode: number | null;
  @Prop({ required: true }) errorType:
    | 'HTTP_ERROR'
    | 'TIMEOUT'
    | 'CONNECTION_ERROR';
  @Prop({ required: true }) errorMessage: string;
  @Prop({ required: true }) responseTimeMs: number;
  @Prop({ default: Date.now }) detectedAt: Date;
}

export const BrokenLinkSchema = SchemaFactory.createForClass(BrokenLink);

BrokenLinkSchema.set('toJSON', {
  versionKey: false,
});

BrokenLinkSchema.set('toObject', {
  versionKey: false,
});
