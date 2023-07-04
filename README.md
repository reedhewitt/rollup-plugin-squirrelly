# vite-plugin-squirrelly
**A Vite plugin to render files with SquirrellyJS**

This plugin applies the [Squirrelly](https://squirrelly.js.org/) renderer to the input files, which is awesome for generating a static site. Inspired by [vite-plugin-handlebars](https://github.com/alexlafroscia/vite-plugin-handlebars).

Supposing you have some HTML template files in `./src`, some HTML partials in `./partials`, and a JSON file with template values in `./data.json`, your `vite.config.js` could look like:

```js
import Squirelly from 'vite-plugin-squirrelly';
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
      data: JSON.parse(readFileSync('data.json', 'utf8')),
      partialsDir: '../partials'
    })
  ],
};
```

When you run `vite build`, the HTML files will be parsed with Squirrelly and output to `./dist`.

## Plugin Options

The object passed to the `Squirrelly()` plugin can include more:

```js
{
  // Data for your templates.
  data: {
    siteName: 'My Website',
    copyrightYear: (new Date()).getFullYear()
  },
  
  // Config options to apply to Squirrelly.
  options: {
    varName: 'x'
  },
  
  // The directory where partials are stored relative to the Vite root.
  partialsDir: '../partials',
  
  // Filters to define in Squirrelly.
  filters: {
    myfilter: function(str) {
      // Do something...
    }
  },
  
  helpers: {
    myhelper: function(content, blocks, config){
      // Do something...
    }
  },
  
  // Optional render callback to be used when the Squirrelly async option is set to true.
  renderCallback: function(err, templateReturn){
    // Do something...
  }
}
```

And finally, the `data` item can be a function that receives the current page as an argument and returns a customized data object.

```js
// Defined above the "export default" Vite config object:
const dataObject = JSON.parse(readFileSync('data.json', 'utf8'));

// Object to pass into Squirrelly():
{
  async data(relPath){
    // Tell every page what its path is.
    dataObject.relPath = relPath;
    
    // Also format a clean path with index.html and trailing slash removed (except root slash).
    dataObject.relPathClean = relPath.replace(/((?<!^)\/)?index\.html$/, '');
    
    return dataObject;
  }
}
```

That's all, folks! Consult the [Squirrelly docs](https://squirrelly.js.org/docs) for details about template syntax and API options.
