import { useEffect, useState } from 'react';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { getBadge, resolveLocale } from '@rewilok/app-store-badges/registry';
import type { Product, Theme } from '@rewilok/app-store-badges/registry';

export interface BadgeProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** BCP-47 locale tag. If omitted, `navigator.languages` is consulted. */
  locale?: string;
  /** Fallback locale if no match is found. Default `'en'`. */
  fallback?: string;
  /** Optional link. When set, renders `<a>` with the given href. */
  href?: string;
  /** Anchor target when `href` is set. Defaults to `'_blank'`. */
  target?: string;
  /** Anchor rel when `href` is set. Defaults to `'noopener noreferrer'`. */
  rel?: string;
  /** Accessible label. Defaults to the product's official English label. */
  'aria-label'?: string;
  /** Rendered while the SVG is loading. */
  placeholder?: ReactNode;
  /** Inline style applied to the wrapping element. */
  style?: CSSProperties;
}

interface InternalProps extends BadgeProps {
  product: Product;
  theme: Theme;
  defaultLabel: string;
}

function BadgeInternal({
  product,
  theme,
  defaultLabel,
  locale,
  fallback,
  href,
  target,
  rel,
  placeholder,
  style,
  ...rest
}: InternalProps) {
  const initialLocale = (() => {
    try {
      return resolveLocale(product, locale, fallback, theme);
    } catch {
      return undefined;
    }
  })();

  const [state, setState] = useState<{ svg: string; locale: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    getBadge(product, { locale, fallback, theme })
      .then((b) => {
        if (!cancelled) setState(b);
      })
      .catch((err) => {
        console.error('[app-store-badges-react]', err);
      });
    return () => {
      cancelled = true;
    };
  }, [product, theme, locale, fallback]);

  const ariaLabel = rest['aria-label'] ?? defaultLabel;
  const wrapperStyle: CSSProperties = {
    display: 'inline-block',
    lineHeight: 0,
    ...style,
  };

  const svgMarkup = state?.svg ?? null;

  if (href) {
    return (
      <a
        href={href}
        target={target ?? '_blank'}
        rel={rel ?? 'noopener noreferrer'}
        aria-label={ariaLabel}
        data-locale={state?.locale ?? initialLocale}
        style={wrapperStyle}
        {...rest}
        {...(svgMarkup ? { dangerouslySetInnerHTML: { __html: svgMarkup } } : {})}
      >
        {svgMarkup ? null : (placeholder ?? null)}
      </a>
    );
  }

  return (
    <span
      role="img"
      aria-label={ariaLabel}
      data-locale={state?.locale ?? initialLocale}
      style={wrapperStyle}
      {...rest}
      {...(svgMarkup ? { dangerouslySetInnerHTML: { __html: svgMarkup } } : {})}
    >
      {svgMarkup ? null : (placeholder ?? null)}
    </span>
  );
}

export interface AppStoreBadgeProps extends BadgeProps {
  /** `'black'` (default) or `'white'`. */
  theme?: Theme;
}

export function AppStoreBadge({ theme = 'black', ...rest }: AppStoreBadgeProps) {
  return (
    <BadgeInternal
      product="app-store"
      theme={theme}
      defaultLabel="Download on the App Store"
      {...rest}
    />
  );
}

export type GooglePlayBadgeProps = BadgeProps;

export function GooglePlayBadge(props: GooglePlayBadgeProps) {
  return (
    <BadgeInternal
      product="google-play"
      theme="black"
      defaultLabel="Get it on Google Play"
      {...props}
    />
  );
}
