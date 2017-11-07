/* @flow */

import path from 'path';
import fs from 'fs';
import * as React from 'react';
import ReactDOMServer from 'react-dom/server';
import HTML from './templates/HTML';
import App from './templates/App';
import type { Route } from './types/Route';
import type { Metadata } from './types/Metadata';

type Options = {
  data: Array<Array<Metadata>>,
  route: Route,
  transpile: boolean,
  output: string,
  layout: string,
};

export default function buildHTML({
  route,
  data,
  transpile,
  output,
  layout,
}: Options) {
  /* $FlowFixMe */
  const Layout = require(layout); // eslint-disable-line global-require
  const html = ReactDOMServer.renderToString(
    <App
      name={route.name}
      data={data}
      layout={Layout.__esModule ? Layout.default : Layout}
    />
  );

  let body = `<div id='root'>${html}</div>`;

  body += `
    <script>
      window.__INITIAL_PATH__ = '${route.name}';
    </script>
  `;

  if (transpile) {
    body += '<script src="app.bundle.js?transpile=false"></script>';
  } else {
    body += '<script src="app.src.js"></script>';
  }

  fs.writeFileSync(
    path.join(output, `${route.name}.html`),
    ReactDOMServer.renderToString(
      // eslint-disable-next-line react/jsx-pascal-case
      <HTML
        title={route.title}
        description={route.description || ''}
        body={body}
        sheet="app.css"
      />
    )
  );
}
