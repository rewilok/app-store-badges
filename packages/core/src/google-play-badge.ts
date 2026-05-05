import { BadgeElement } from './base-element.js';
import type { Product, Theme } from './types.js';

export class GooglePlayBadgeElement extends BadgeElement {
  protected override readonly product: Product = 'google-play';
  // Only a black variant is published by Google.
  protected override readonly allowedThemes: readonly Theme[] = ['black'];
}
