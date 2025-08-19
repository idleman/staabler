function reduceToFinalPath(state, segment, index) {
  switch(segment) {
    case '':
      if(index === 0) {
        state.push(segment);
        return state;
      }

      state.length = 1;
      return state;
    case '.':
      return state;
    case '..':
      state.pop();
      return state;
    default:
      state.push(segment);
      return state;
  }
}

const mapToURIComponent = str => encodeURIComponent(str);

export default class Path {

  static normalize(...args) {
    if(args.length === 0) {
      return '';
    }

    const segments = [];
    for(const path of args) {

      let next = path
        .replaceAll('\\', '/')
        .replaceAll('//', '/');
  
      while(next.includes('//')) {
        next = next.replace('//', '/');
      }
      segments.push(...next.split('/'));
    }
    const normalized = segments
      .reduce(reduceToFinalPath, [])
      .join('/');

    const initial = args[0];
    return  initial.startsWith('./') ? `./${normalized}` :
            initial.includes('file:///') ? normalized.replace('file:/', 'file:///') :
            initial.includes('file://') ? normalized.replace('file:/', 'file://') :
            initial.includes('://') ? normalized.replace(':/', '://') :
            normalized;
  }


  static toURL(str = '') {
    if(str.includes('://') && URL.canParse(str)) {
      return str;
    }

    const normalized = Path.normalize(str);
    const windowsDeviceSepertor = normalized.indexOf(':/'); // only on windows.
    if(windowsDeviceSepertor === -1) {
      return `file://${normalized.split('/').map(mapToURIComponent).join('/')}`;
    }

    const url = normalized
      .split(':/')
      .map(str => str.split('/').map(mapToURIComponent).join('/'))
      .join(':/');
    

    return `file:///${url}`;
  }

  static toPath(url = '') {
    const pos = url.indexOf('://');
    if(pos === -1) {
      return url;
    }
    const rest = url.slice(pos + 3);
    if(!rest.includes(':/')) {
      return rest.split('/').map(str => decodeURIComponent(str)).join('/');
    }
    const [first, second] = rest.split(':/');
    const start = first.startsWith('/') ? first.slice(1) : first;
    const path = second.split('/').map(str => decodeURIComponent(str)).join('/');
    return `${start}:/${path}`;
  }


  static dirname(path, defaultValue = '/') {
    const pos = path.lastIndexOf('/');
    const result = pos === -1 ? defaultValue : path.slice(0, pos);
    return result === 'file://' ? 'file:///' : result;
    //path.split('/').slice(0, -1).join('/');
  }
  
  // static resolve(from = '', to = '') {
  //   if(to.startsWith('/') || to.indexOf(':/') === 1) {
  //     return to;
  //   }


  //   const toParts = to.split('/');
  //   const fromParts = from.split('/');
    
  //   const length = Math.min(toParts.length, fromParts.length);
  //   for(let i = 0; i < length; ++i) {
  //     const value = toParts[i];
  //     if(value !== fromParts[i]) {
  //       break;
  //     }
  //     sharedParts.push(value);
  //   }


  //   const sharedParts = fromParts.split('/').filter(part => toParts.includes(part));
  //   const relativeParts = toParts.split('/').filter(part => !fromParts.includes(part));
  //   return `./${relativeParts.join('/')}`;
  // }

  // static toURL(str = '') {
  //   if(URL.canParse(str)) {
  //     return str;
  //   }

  //   const path = Path
  //     .normalize(str)
  //     .split('/')
  //     .map(mapToURIComponent)
  //     .join('/');

  //   return path.indexOf(':/') === 1 ? `file:///${path}` : path;

    
    
  //   return `file:///${encoded}`;
  // }
  

};