import { Injectable } from '@nestjs/common';
import pLimit from 'p-limit';
import {
  IConcurrencyLimiter,
  IConcurrencyLimiterFactory,
} from 'src/crawler/interfaces/concurrency-limiter.interface';

@Injectable()
export class PLimitConcurrencyLimiterFactory implements IConcurrencyLimiterFactory {
  create(concurrency: number): IConcurrencyLimiter {
    const limiter = pLimit(concurrency);
    return {
      run: <T>(fn: () => Promise<T>) => limiter(fn),
      get activeCount() {
        return limiter.activeCount;
      },
    };
  }
}
