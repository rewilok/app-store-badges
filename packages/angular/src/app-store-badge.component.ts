import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { BadgeBase } from './badge-base';
import type { Theme, Product } from '@rewilok/app-store-badges';

@Component({
  selector: 'app-store-badge',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    ':host { display: inline-block; line-height: 0; }',
    'a, span { display: inline-block; line-height: 0; color: inherit; text-decoration: none; }',
    ':host ::ng-deep svg { display: block; width: 100%; height: auto; }',
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
export class AppStoreBadgeComponent extends BadgeBase {
  @Input() theme: Theme = 'black';
  protected override readonly product: Product = 'app-store';
  protected override readonly defaultLabel = 'Download on the App Store';
  protected override get activeTheme(): Theme {
    return this.theme;
  }

  constructor(sanitizer: DomSanitizer, cdr: ChangeDetectorRef) {
    super(sanitizer, cdr);
  }
}
