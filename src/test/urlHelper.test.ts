import { describe, it, expect } from 'vitest';
import { generateShareableUrl } from '../utils/urlHelper';

describe('urlHelper', () => {
  it('generates a shareable URL for remote URL endpoint with jsonPath and search', () => {
    const url = generateShareableUrl({
      sourceType: 'url',
      url: 'https://dummyjson.com/products',
      jsonPath: '$.products',
      globalFilter: 'mascara',
    });

    expect(url).toContain('url=https%3A%2F%2Fdummyjson.com%2Fproducts');
    expect(url).toContain('path=%24.products');
    expect(url).toContain('q=mascara');
  });

  it('embeds raw JSON in URL if small (<2KB)', () => {
    const smallJson = JSON.stringify([{ id: 1, name: 'Sample' }]);
    const url = generateShareableUrl({
      sourceType: 'raw',
      url: '',
      jsonPath: '$',
      rawJson: smallJson,
    });

    expect(url).toContain('raw=');
  });
});
