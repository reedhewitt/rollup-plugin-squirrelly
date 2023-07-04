import * as Sqrl from 'squirrelly';
import { normalize, relative, resolve, sep } from 'path';
import { globSync } from 'glob';
import { readFileSync } from 'fs';

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

function Squirelly({
  data = {},
  options = {},
  partialsDir,
  filters,
  helpers,
  renderCallback
} = {}) {
  // The root dir will be defined in the configResolved hook method.
  let root;
  
  const trailingSlashRegex = new RegExp( escapeRegExp(sep) + '$');
  
  // Define filters that were passed by the user.
  if(filters){
    const filterNames = Object.keys(filters);
    for(let i = 0; i < filterNames.length; i++){
      if(typeof filters[filterNames[i]] === 'function'){
        Sqrl.filters.define(filterNames[i], filters[filterNames[i]]);
      }
    }
  }
  
  // Define helpers that were passed by the user.
  if(helpers){
    const helperNames = Object.keys(helpers);
    for(let i = 0; i < helperNames.length; i++){
      if(typeof helpers[helperNames[i]] === 'function'){
        Sqrl.helpers.define(helperNames[i], helpers[helperNames[i]]);
      }
    }
  }
  
  return {
    name: 'squirelly',
    enforce: 'pre',
    
    configResolved(viteConfig) {
      // Root dir with trailing slash removed.
      root = normalize(viteConfig.root).replace(trailingSlashRegex, '');
      
      // Glob the partials directory and define each HTML file as a partial.
      if(partialsDir){
        // Make sure partialsDir is an absolute path with no trailing slash.
        partialsDir = resolve(root, normalize(partialsDir).replace(trailingSlashRegex, ''));
        
        const partialFiles = globSync(partialsDir + '/**/*.html');
        
        for(let i = 0; i < partialFiles.length; i++){
          const partialRelative = relative(partialsDir, partialFiles[i]);
          const partialName = partialRelative.replace(/\.html$/i, '');
          const partialContent = readFileSync(partialFiles[i], 'utf8');
          Sqrl.templates.define(partialName, Sqrl.compile(partialContent, Sqrl.getConfig(options)));
        }
      }
    },
    
    async transform(html, id){
      // Page path relative to root.
      const relPath = sep + relative(root, id).replace(trailingSlashRegex, '');
      
      const templateData = typeof data === 'function' ? await data(relPath) : data;
      
      return Sqrl.render(html, templateData, options, renderCallback);
    }
  };
}

export { Squirelly as default };