export const LINK_EXTRACTOR = Symbol('ILinkExtractor');

export interface ILinkExtractor {
  extractLinks(html: string, baseUrl: string): string[];
}
