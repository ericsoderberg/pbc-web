
export function searchToObject(search) {
  const params = {};
  if (search) {
    search.slice(1).split('&').forEach((param) => {
      const [name, value] = param.split('=');
      params[name] = decodeURIComponent(value);
    });
  }
  return params;
}

export function getLocationParams() {
  return searchToObject(window.location.search);
}

// export function replaceLocationParams (params) {
//   const search = Object.keys(params)
//   .map(name => `${name}=${encodeURIComponent(params[name])}`).join('&');
//   window.history.pushState(undefined, undefined, `?${search}`);
// }
