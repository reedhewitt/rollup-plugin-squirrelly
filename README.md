# vite-plugin-squirrelly
**A Vite plugin to render files with SquirrellyJS**

This plugin applies the [Squirrelly](https://squirrelly.js.org/) renderer to the input files, which is awesome for generating a static site. Inspired by [vite-plugin-handlebars](https://github.com/alexlafroscia/vite-plugin-handlebars).

## Usage

Supposing you have some HTML files in `./src`, some partials in `./partials`, and a JSON file with template values in `./data.json`, your `vite.config.js` could look like:

```js
import Squirelly from 'vite-plugin-squirrelly';
import { globSync } from 'glob';
import { readFileSync } from 'fs';

export default {
  root: 'src',
  publicDir: '../public', // relative to Vite root
  build: {
    outDir: '../dist', // relative to Vite root
    rollupOptions: {
      // Get all HTML files in an object. The relative file paths are used as both keys and values.
      // Note that these files should have a lowercase file extension that Vite understands,
      // such as *.html. By default you can't use *.sqrl for the input files.
      input: Object.fromEntries(globSync('src/**/*.html').map(file => [file, file]))
    }
  },
  plugins: [
    Squirelly({
      // Parse the JSON and use it as the data arg for Squirrelly.render().
      data: JSON.parse(readFileSync('data.json', 'utf8')),
      
      // The partials directory relative to the Vite root.
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
  // Data for your templates as an object or a function that returns an object
  // (see below for details on using a function).
  data: {
    siteName: 'My Website',
    copyrightYear: (new Date()).getFullYear()
  },
  
  // Config options to apply to Squirrelly.
  options: {
    varName: 'x'
  },
  
  // The directories where partials and layouts are stored relative to the Vite root.
  // Unlike the build.rollupOptions.input files in the example above, your partials
  // and layouts can use either *.html or *.sqrl extensions.
  partialsDir: '../partials',
  layoutsDir: '../layouts',
  
  // Filters to define in Squirrelly.
  filters: {
    myfilter: function(str){
      // Do something...
    }
  },
  
  // Helpers to define in Squirrelly.
  helpers: {
    myhelper: function(content, blocks, config){
      // Do something...
    }
  },
  
  // Optional render callback to be used when the Squirrelly async option is set to true.
  renderCallback(err, templateReturn){
    // Do something...
  }
}
```

And finally, the `data` item can be a function that receives the current page as an argument and returns a customized data object.

```js
// Defined above the "export default" Vite config object:
const dataObject = JSON.parse(readFileSync('data.json', 'utf8'));

// Object passed to Squirrelly():
{
  data(relPath){
    // Tell every page what its path is.
    dataObject.relPath = relPath;
    
    // Also format a clean path with index.html and trailing slash removed (except root slash).
    dataObject.relPathClean = relPath.replace(/((?<!^)\/)?index\.(html|sqrl)$/, '');
    
    // Do any other page-specific stuff with the data...
    
    return dataObject;
  }
}
```

Consult the [Squirrelly docs](https://squirrelly.js.org/docs) for details about template syntax and API options. As of this writing, layouts are not well documented in Squirrelly, but [you can see some examples here](https://github.com/squirrellyjs/squirrelly/tree/master/test/templates).
