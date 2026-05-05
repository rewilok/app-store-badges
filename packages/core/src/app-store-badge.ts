import { BadgeElement } from './base-element.js';
import type { Product, Theme } from './types.js';

export class AppStoreBadgeElement extends BadgeElement {
  protected override readonly product: Product = 'app-store';
  protected override readonly allowedThemes: readonly Theme[] = ['black', 'white'];
}
