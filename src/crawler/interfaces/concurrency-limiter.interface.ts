export const CONCURRENCY_LIMITER_FACTORY = Symbol('IConcurrencyLimiterFactory');

export interface IConcurrencyLimiter {
  run<T>(fn: () => Promise<T>): Promise<T>;
  readonly activeCount: number;
}

export interface IConcurrencyLimiterFactory {
  create(concurrency: number): IConcurrencyLimiter;
}
