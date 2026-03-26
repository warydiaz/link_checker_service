import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { FetchResult, IHttpFetcher } from './interfaces/http-fetcher.interface';

@Injectable()
export class HttpFetcherService implements IHttpFetcher {
  private readonly logger = new Logger(HttpFetcherService.name);

  constructor(private readonly configService: ConfigService) {}

  async fetch(url: string): Promise<FetchResult> {
    const timeout = this.configService.get<number>('REQUEST_TIMEOUT_MS', 10000);
    const start = Date.now();

    try {
      const response = await axios.get(url, {
        timeout,
        headers: {
          'User-Agent': this.configService.get('USER_AGENT', 'LinkChecker/1.0'),
        },
        validateStatus: () => true,
      });

      const responseTimeMs = Date.now() - start;
      const contentType = response.headers['content-type'] ?? '';

      if (!contentType.includes('text/html')) {
        this.logger.debug(
          `Skipping non-HTML content at ${url} (${contentType})`,
        );
        return { html: null, statusCode: response.status, responseTimeMs };
      }

      return {
        html: response.data as string,
        statusCode: response.status,
        responseTimeMs,
      };
    } catch (error: unknown) {
      const responseTimeMs = Date.now() - start;
      const axiosError = error as {
        code?: string;
        response?: { status: number };
        message?: string;
      };
      const errorType =
        axiosError.code === 'ECONNABORTED' ? 'TIMEOUT' : 'HTTP_ERROR';
      const message = error instanceof Error ? error.message : String(error);

      this.logger.warn(`Failed to fetch ${url}: ${message}`);

      return {
        html: null,
        statusCode: axiosError.response?.status ?? null,
        responseTimeMs,
        error: { type: errorType, message },
      };
    }
  }
}
