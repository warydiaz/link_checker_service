export const DOMAIN_FILTER = Symbol('IDomainFilter');

export interface IDomainFilter {
  isAllowed(url: string, seedUrl: string): boolean;
}
