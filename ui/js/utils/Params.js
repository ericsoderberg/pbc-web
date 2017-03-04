
export function getLocationParams() {
  const params = {};
  if (window.location.search) {
    window.location.search.slice(1).split('&').forEach((param) => {
      const [name, value] = param.split('=');
      params[name] = decodeURIComponent(value);
    });
  }
  return params;
}

// export function replaceLocationParams (params) {
//   const search = Object.keys(params)
//   .map(name => `${name}=${encodeURIComponent(params[name])}`).join('&');
//   window.history.pushState(undefined, undefined, `?${search}`);
// }
