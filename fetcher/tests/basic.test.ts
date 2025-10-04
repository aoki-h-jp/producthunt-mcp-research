/**
 * Basic tests
 */
import { describe, it, expect } from 'vitest';
import { ProductHuntClient } from '../src/clients/product-hunt.js';
import { PostsClient } from '../src/clients/posts.js';
import { TopicsClient } from '../src/clients/topics.js';
import { CollectionsClient } from '../src/clients/collections.js';

describe('Client Exports', () => {
  it('should export ProductHuntClient', () => {
    expect(ProductHuntClient).toBeDefined();
  });

  it('should export PostsClient', () => {
    expect(PostsClient).toBeDefined();
  });

  it('should export TopicsClient', () => {
    expect(TopicsClient).toBeDefined();
  });

  it('should export CollectionsClient', () => {
    expect(CollectionsClient).toBeDefined();
  });
});
