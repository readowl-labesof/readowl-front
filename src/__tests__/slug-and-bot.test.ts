import { describe, it, expect } from 'vitest';
import { slugify } from '@/lib/slug';
import { isLikelyBot } from '@/lib/bot';

describe('slugify', () => {
  it('makes SEO-friendly slugs', () => {
    expect(slugify('O Monarca do Céu')).toBe('o-monarca-do-ceu');
    expect(slugify('  Espaços   e --- sinais!!! ')).toBe('espacos-e-sinais');
  });
});

describe('isLikelyBot', () => {
  it('detects common crawlers', () => {
    expect(isLikelyBot('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)')).toBe(true);
    expect(isLikelyBot('curl/8.4.0')).toBe(true);
    expect(isLikelyBot('Wget/1.21.2')).toBe(true);
  });
  it('allows normal browsers', () => {
    expect(isLikelyBot('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36')).toBe(false);
  });
});
