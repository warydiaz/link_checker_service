import { Injectable } from '@nestjs/common';
import { IDomainFilter } from './interfaces/domain-filter.interface';

@Injectable()
export class SameDomainFilter implements IDomainFilter {
  isAllowed(url: string, seedUrl: string): boolean {
    try {
      return new URL(url).hostname === new URL(seedUrl).hostname;
    } catch {
      return false;
    }
  }
}
