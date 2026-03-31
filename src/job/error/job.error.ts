import { BaseError } from 'src/error';

export class JobError extends BaseError {
  private constructor(status: number, message: string) {
    super('job-error', status, message);
  }

  static JobNotFound() {
    return new JobError(404, `Job not found`);
  }
}
