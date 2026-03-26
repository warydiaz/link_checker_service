export const HTTP_FETCHER = Symbol('IHttpFetcher');

export interface FetchResult {
  html: string | null;
  statusCode: number | null;
  responseTimeMs: number;
  error?: {
    type: 'TIMEOUT' | 'HTTP_ERROR' | 'CONNECTION_ERROR';
    message: string;
  };
}

export interface IHttpFetcher {
  fetch(url: string): Promise<FetchResult>;
}
