import * as Sqrl from 'squirrelly';

function Squirelly({
  data
} = {}) {
  return {
    name: 'squirelly',
    enforce: 'pre',
    
    async transform(html, id){
      return Sqrl.render(html, data);
    }
  };
}

export { Squirelly as default };