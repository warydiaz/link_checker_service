import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { FetchResult, IHttpFetcher } from './interfaces/http-fetcher.interface';

@Injectable()
export class HttpFetcherService implements IHttpFetcher {
  private readonly logger = new Logger(HttpFetcherService.name);
  #METHOD_NOT_ALLOWED = 405;
  #NOT_IMPLEMENTED = 501;
  #CLIENT_OR_SERVER_ERROR = 400;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async fetch(url: string): Promise<FetchResult> {
    const timeout = this.configService.get<number>('REQUEST_TIMEOUT_MS', 10000);
    const start = Date.now();
    const headers = {
      'User-Agent': this.configService.get<string>(
        'USER_AGENT',
        'LinkChecker/1.0',
      ),
    };

    try {
      const headResponse = await firstValueFrom(
        this.httpService.head(url, {
          timeout,
          headers,
          validateStatus: () => true,
        }),
      );

      // Some servers don't support HEAD — fall back to GET
      if (
        headResponse.status === this.#METHOD_NOT_ALLOWED ||
        headResponse.status === this.#NOT_IMPLEMENTED
      ) {
        return this.fetchWithGet(url, start, timeout, headers);
      }

      const responseTimeMs = Date.now() - start;

      if (headResponse.status >= this.#CLIENT_OR_SERVER_ERROR) {
        return {
          html: null,
          statusCode: headResponse.status,
          responseTimeMs,
          error: { type: 'HTTP_ERROR', message: `HTTP ${headResponse.status}` },
        };
      }

      const contentType =
        (headResponse.headers['content-type'] as string | undefined) ?? '';

      // Only do GET if it looks like HTML
      if (contentType.includes('text/html') || contentType === '') {
        return this.fetchWithGet(url, start, timeout, headers);
      }

      this.logger.debug(`Validated non-HTML link at ${url} (${contentType})`);
      return { html: null, statusCode: headResponse.status, responseTimeMs };
    } catch (error: unknown) {
      const responseTimeMs = Date.now() - start;
      return this.mapNetworkError(url, error, responseTimeMs);
    }
  }

  private async fetchWithGet(
    url: string,
    start: number,
    timeout: number,
    headers: Record<string, string>,
  ): Promise<FetchResult> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<string>(url, {
          timeout,
          headers,
          validateStatus: () => true,
        }),
      );
      const responseTimeMs = Date.now() - start;
      return this.classifyGetResponse(url, response, responseTimeMs);
    } catch (error: unknown) {
      const responseTimeMs = Date.now() - start;
      return this.mapNetworkError(url, error, responseTimeMs);
    }
  }

  private classifyGetResponse(
    url: string,
    response: AxiosResponse,
    responseTimeMs: number,
  ): FetchResult {
    if (response.status >= this.#CLIENT_OR_SERVER_ERROR) {
      return {
        html: null,
        statusCode: response.status,
        responseTimeMs,
        error: { type: 'HTTP_ERROR', message: `HTTP ${response.status}` },
      };
    }

    const contentType =
      (response.headers['content-type'] as string | undefined) ?? '';
    if (!contentType.includes('text/html')) {
      this.logger.debug(`Skipping non-HTML content at ${url} (${contentType})`);
      return { html: null, statusCode: response.status, responseTimeMs };
    }

    return {
      html: response.data as string,
      statusCode: response.status,
      responseTimeMs,
    };
  }

  private mapNetworkError(
    url: string,
    error: unknown,
    responseTimeMs: number,
  ): FetchResult {
    const axiosError = error as {
      code?: string;
      response?: { status: number };
      message?: string;
    };
    const errorType =
      axiosError.code === 'ECONNABORTED'
        ? 'TIMEOUT'
        : axiosError.code === 'ECONNRESET'
          ? 'CONNECTION_ERROR'
          : 'HTTP_ERROR';
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
