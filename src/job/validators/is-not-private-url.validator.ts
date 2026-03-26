import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import * as net from 'net';

const PRIVATE_RANGES_V4 = [
  { base: 0x0a000000, mask: 0xff000000 }, // 10.0.0.0/8
  { base: 0xac100000, mask: 0xfff00000 }, // 172.16.0.0/12
  { base: 0xc0a80000, mask: 0xffff0000 }, // 192.168.0.0/16
  { base: 0x7f000000, mask: 0xff000000 }, // 127.0.0.0/8 (loopback)
  { base: 0xa9fe0000, mask: 0xffff0000 }, // 169.254.0.0/16 (link-local)
  { base: 0x00000000, mask: 0xff000000 }, // 0.0.0.0/8
  { base: 0x64400000, mask: 0xffc00000 }, // 100.64.0.0/10 (CGNAT)
];

function isPrivateIpv4(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  const n =
    ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
  return PRIVATE_RANGES_V4.some(({ base, mask }) => (n & mask) >>> 0 === base);
}

function isPrivateIpv6(ip: string): boolean {
  // ::1 loopback, fc00::/7 unique local, fe80::/10 link-local
  const normalized = ip.toLowerCase();
  return (
    normalized === '::1' ||
    normalized.startsWith('fc') ||
    normalized.startsWith('fd') ||
    normalized.startsWith('fe8') ||
    normalized.startsWith('fe9') ||
    normalized.startsWith('fea') ||
    normalized.startsWith('feb')
  );
}

@ValidatorConstraint({ async: true })
export class IsNotPrivateUrlConstraint implements ValidatorConstraintInterface {
  async validate(url: string): Promise<boolean> {
    try {
      const { hostname } = new URL(url);

      const ipsToCheck: string[] = [];

      if (net.isIPv4(hostname)) {
        ipsToCheck.push(hostname);
      } else if (net.isIPv6(hostname)) {
        ipsToCheck.push(hostname);
      } else {
        // Resolver el hostname → IPs reales
        const { resolve4, resolve6 } = await import('dns/promises');
        const [v4, v6] = await Promise.allSettled([
          resolve4(hostname),
          resolve6(hostname),
        ]);
        if (v4.status === 'fulfilled') ipsToCheck.push(...v4.value);
        if (v6.status === 'fulfilled') ipsToCheck.push(...v6.value);
      }

      if (ipsToCheck.length === 0) return false; // no resuelve → rechazar

      return ipsToCheck.every((ip) =>
        net.isIPv6(ip) ? !isPrivateIpv6(ip) : !isPrivateIpv4(ip),
      );
    } catch {
      return false;
    }
  }

  defaultMessage(): string {
    return 'The URL must not resolve to a private or reserved IP address';
  }
}

export function IsNotPrivateUrl(options?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      validator: IsNotPrivateUrlConstraint,
    });
  };
}
