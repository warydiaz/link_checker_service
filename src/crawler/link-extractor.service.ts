import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { ILinkExtractor } from './interfaces/link-extractor.interface';

@Injectable()
export class LinkExtractorService implements ILinkExtractor {
  extractLinks(html: string, baseUrl: string): string[] {
    const $ = cheerio.load(html);
    const links: string[] = [];

    $('a[href], link[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (!href) return;

      try {
        const absolute = new URL(href, baseUrl).toString();
        const parsed = new URL(absolute);

        if (!['http:', 'https:'].includes(parsed.protocol)) return;
        parsed.hash = '';

        links.push(parsed.toString());
      } catch {
        // URL malformada, ignorar
      }
    });

    return links;
  }
}
