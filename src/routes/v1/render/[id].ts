import { renderToString } from '@vue/server-renderer'
import { createSSRApp, h } from 'vue'

const app = createSSRApp({
  setup() {
    return () => h('div', { class: 'hello-world' }, 'Hello World from Bun.serve + Vue SSR!')
  },
});

const html = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Komodo SSR Engine - Vue</title>
    </head>
    <body>
      <div id="app">${await renderToString(app)}</div>
    </body>
  </html>
`;

export const handler = async (req: Request) => {
  // TODO implement S3 call and Vue rendering
  return new Response(html, { headers: { 'Content-Type': 'text/html' } });
};
