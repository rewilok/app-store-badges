// tsup bundles .svg imports as text via `loader: { '.svg': 'text' }`.
// This ambient declaration teaches `tsc` about that shape.
declare module '*.svg' {
  const content: string;
  export default content;
}
