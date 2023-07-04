import * as Sqrl from 'squirrelly';
import { normalize, relative, resolve, sep } from 'path';
import { globSync } from 'glob';
import { readFileSync } from 'fs';

// From MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

// Define filters and helpers in Sqrl.
function defineFH(fh, type){
  if(!fh) return;
  const names = Object.keys(fh);
  for(let i = 0; i < names.length; i++){
    if(typeof fh[names[i]] === 'function'){
      Sqrl[type].define(names[i], fh[names[i]]);
    }
  }
};

// Glob a directory of partials or layouts and define them in Sqrl.
function definePL(plDir, root, sqrlOptions){
  if(!plDir) return;
  
  const trailingSlashRegex = new RegExp(escapeRegExp(sep) + '$');
  
  // Make sure plDir is an absolute path with no trailing slash.
  plDir = resolve(root, normalize(plDir).replace(trailingSlashRegex, ''));
  
  const plFiles = globSync(plDir + '/**/*.{html,sqrl}');
  
  for(let i = 0; i < plFiles.length; i++){
    const plRelative = relative(plDir, plFiles[i]);
    const plName = plRelative.replace(/\.(html|sqrl)$/, '');
    const plContent = readFileSync(plFiles[i], 'utf8');
    Sqrl.templates.define(plName, Sqrl.compile(plContent, Sqrl.getConfig(sqrlOptions)));
  }
}

function Squirelly({
  data = {},
  options = {},
  partialsDir,
  layoutsDir,
  filters,
  helpers,
  renderCallback
} = {}) {
  // The root dir will be defined in the configResolved hook method.
  let root;
  
  const trailingSlashRegex = new RegExp(escapeRegExp(sep) + '$');
  
  // Define filters/helpers that were passed by the user.
  defineFH(filters, 'filters');
  defineFH(helpers, 'helpers');
  
  return {
    name: 'squirelly',
    enforce: 'pre',
    
    configResolved(viteConfig) {
      // Root dir with trailing slash removed.
      root = normalize(viteConfig.root).replace(trailingSlashRegex, '');
      
      // Now that we know root, we can locate the directories for partials and
      // layouts to define each of them.
      definePL(partialsDir, root, options);
      definePL(layoutsDir, root, options);
    },
    
    async transform(html, id){
      // Page path relative to root.
      const relPath = sep + relative(root, id).replace(trailingSlashRegex, '');
      
      // Get template data, whether it is a function or a plain object.
      const templateData = typeof data === 'function' ? data(relPath) : data;
      
      // Return the rendered content.
      return Sqrl.render(html, templateData, options, renderCallback);
    }
  };
}

export { Squirelly as default };