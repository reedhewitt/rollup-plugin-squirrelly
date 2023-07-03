# rollup-plugin-squirrelly
**A Rollup/Vite plugin to render files with SquirrellyJS**

This plugin applies the [Squirrelly](https://squirrelly.js.org/) renderer to the input files, which is awesome if you have a static site and just want to parse some Squirrelly templates without getting a more complex static site generator involved.

Supposing you have some HTML template files in the `./src/` directory of your project and a JSON file with template values in `./data.json`, your `vite.config.js` file could look like:

```js
import Squirelly from '../../../Code/rollup-plugin-squirrelly/index.js';
import { globSync } from 'glob';
import { readFileSync } from 'fs';

export default {
  root: 'src',
  publicDir: '../public', // relative to 'src'
  build: {
    outDir: '../dist', // relative to 'src'
    rollupOptions: {
      // Get all HTML files in an object in which the relative file paths are used as both keys and values.
      input: Object.fromEntries(globSync('src/**/*.html').map(file => [file, file]))
    }
  },
  plugins: [
    Squirelly({
      // Parse the JSON and use it as the data arg for Squirrelly.render().
      data: JSON.parse(readFileSync('data.json'))
    })
  ],
};
```

When you run `vite build`, the HTML files will be parsed with Squirrelly and output to the `./dist/` directory.

I just started working on this, so it is a work-in-progress (or maybe more like a proof of concept).

Inspired by [vite-plugin-handlebars](https://github.com/alexlafroscia/vite-plugin-handlebars).
