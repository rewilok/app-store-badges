import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { BadgeBase } from './badge-base';
import type { Product } from '@rewilok/app-store-badges';

@Component({
  selector: 'google-play-badge',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    ':host { display: inline-block; line-height: 0; height: 40px; }',
    'a, span { display: inline-block; line-height: 0; color: inherit; text-decoration: none; height: 100%; }',
    ':host ::ng-deep svg { display: block; height: 100%; width: auto; }',
  ],
  template: `
    <a
      *ngIf="href; else spanTpl"
      [href]="href"
      [attr.target]="anchorTarget"
      [attr.rel]="anchorRel"
      [attr.aria-label]="ariaLabel"
      [attr.data-locale]="resolvedLocale"
      [innerHTML]="svgHtml"
    ></a>
    <ng-template #spanTpl>
      <span
        role="img"
        [attr.aria-label]="ariaLabel"
        [attr.data-locale]="resolvedLocale"
        [innerHTML]="svgHtml"
      ></span>
    </ng-template>
  `,
})
export class GooglePlayBadgeComponent extends BadgeBase {
  protected override readonly product: Product = 'google-play';
  protected override readonly defaultLabel = 'Get it on Google Play';

  constructor(sanitizer: DomSanitizer, cdr: ChangeDetectorRef) {
    super(sanitizer, cdr);
  }
}
