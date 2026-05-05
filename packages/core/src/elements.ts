// Side-effectful entry: importing this module registers the custom elements.
import { defineCustomElements } from './custom-elements.js';

defineCustomElements();

export * from './custom-elements.js';
