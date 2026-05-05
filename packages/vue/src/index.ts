import { defineComponent, h, onMounted, ref, watch, type PropType, type VNode } from 'vue';
import { getBadge, resolveLocale } from '@rewilok/app-store-badges/registry';
import type { Product, Theme } from '@rewilok/app-store-badges/registry';

interface InternalState {
  svg: string;
  locale: string;
}

function createBadgeComponent(product: Product, defaultTheme: Theme, defaultLabel: string, allowThemeProp: boolean) {
  return defineComponent({
    name: product === 'app-store' ? 'AppStoreBadge' : 'GooglePlayBadge',
    props: {
      locale: { type: String, default: undefined },
      fallback: { type: String, default: undefined },
      theme: { type: String as PropType<Theme>, default: defaultTheme },
      href: { type: String, default: undefined },
      target: { type: String, default: undefined },
      rel: { type: String, default: undefined },
      ariaLabel: { type: String, default: undefined },
    },
    setup(props, { slots }) {
      const state = ref<InternalState | null>(null);
      const initialLocale = ref<string | undefined>(undefined);
      try {
        initialLocale.value = resolveLocale(product, props.locale, props.fallback, allowThemeProp ? props.theme : defaultTheme);
      } catch {
        initialLocale.value = undefined;
      }

      const load = async () => {
        try {
          const theme = allowThemeProp ? props.theme : defaultTheme;
          const b = await getBadge(product, { locale: props.locale, fallback: props.fallback, theme });
          state.value = b;
        } catch (err) {
          console.error('[app-store-badges-vue]', err);
        }
      };

      onMounted(load);
      watch(() => [props.locale, props.fallback, props.theme], load);

      return (): VNode => {
        const svg = state.value?.svg;
        const locale = state.value?.locale ?? initialLocale.value;
        const ariaLabel = props.ariaLabel ?? defaultLabel;
        const style = { display: 'inline-block', lineHeight: 0 };

        const inner = svg
          ? h('template', {}, []) // placeholder — innerHTML set via domProps
          : slots.placeholder?.() ?? null;

        const attrs: Record<string, unknown> = {
          'data-locale': locale,
          style,
        };
        if (svg) attrs.innerHTML = svg;

        if (props.href) {
          return h(
            'a',
            {
              ...attrs,
              href: props.href,
              target: props.target ?? '_blank',
              rel: props.rel ?? 'noopener noreferrer',
              'aria-label': ariaLabel,
            },
            svg ? [] : [inner],
          );
        }
        return h(
          'span',
          {
            ...attrs,
            role: 'img',
            'aria-label': ariaLabel,
          },
          svg ? [] : [inner],
        );
      };
    },
  });
}

export const AppStoreBadge = createBadgeComponent(
  'app-store',
  'black',
  'Download on the App Store',
  true,
);

export const GooglePlayBadge = createBadgeComponent(
  'google-play',
  'black',
  'Get it on Google Play',
  false,
);

export type { Theme, Product } from '@rewilok/app-store-badges/registry';
