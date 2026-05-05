import { ChangeDetectorRef, Input, Directive, OnChanges, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { getBadge } from '@rewilok/app-store-badges';
import type { Product, Theme } from '@rewilok/app-store-badges';

@Directive()
export abstract class BadgeBase implements OnChanges {
  @Input() locale?: string;
  @Input() fallback?: string;
  @Input() href?: string;
  @Input() target?: string;
  @Input() rel?: string;
  @Input('aria-label') ariaLabelInput?: string;

  svgHtml: SafeHtml | null = null;
  resolvedLocale: string | null = null;

  protected abstract readonly product: Product;
  protected abstract readonly defaultLabel: string;
  protected readonly defaultTheme: Theme = 'black';

  /** Overridden by subclasses that expose a `theme` input. */
  protected get activeTheme(): Theme {
    return this.defaultTheme;
  }

  constructor(
    protected readonly sanitizer: DomSanitizer,
    protected readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnChanges(_changes: SimpleChanges): void {
    void this.load();
  }

  protected async load(): Promise<void> {
    try {
      const { svg, locale } = await getBadge(this.product, {
        locale: this.locale,
        fallback: this.fallback,
        theme: this.activeTheme,
      });
      this.svgHtml = this.sanitizer.bypassSecurityTrustHtml(svg);
      this.resolvedLocale = locale;
      this.cdr.markForCheck();
    } catch (err) {
      console.error('[app-store-badges-angular]', err);
    }
  }

  get ariaLabel(): string {
    return this.ariaLabelInput ?? this.defaultLabel;
  }

  get anchorTarget(): string {
    return this.target ?? '_blank';
  }

  get anchorRel(): string {
    return this.rel ?? 'noopener noreferrer';
  }
}
