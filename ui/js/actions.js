import FileSaver from 'file-saver';
import { setTimezone } from './utils/Time';

export const AUDIT_LOG_LOAD = 'AUDIT_LOG_LOAD';
export const AUDIT_LOG_UNLOAD = 'AUDIT_LOG_UNLOAD';
export const CALENDAR_LOAD = 'CALENDAR_LOAD';
export const CALENDAR_UNLOAD = 'CALENDAR_UNLOAD';
export const CATEGORY_LOAD = 'CATEGORY_LOAD';
export const CATEGORY_UNLOAD = 'CATEGORY_UNLOAD';
export const ITEM_LOAD = 'ITEM_LOAD';
export const ITEM_UNLOAD = 'ITEM_UNLOAD';
export const SEARCH_LOAD = 'SEARCH_LOAD';
export const SEARCH_UNLOAD = 'SEARCH_UNLOAD';
export const SESSION_LOAD = 'SESSION_LOAD';
export const SESSION_UNLOAD = 'SESSION_UNLOAD';
export const SITE_LOAD = 'SITE_LOAD';
export const SITE_UNLOAD = 'SITE_UNLOAD';

const _headers = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};
let _sessionId;

export function getHeaders() {
  return { ..._headers };
}

export function getHeader(name) {
  return _headers[name];
}

const processStatus = (response) => {
  if (response.ok) {
    return Promise.resolve(response);
  }
  return response.json()
    .then(json => Promise.reject(json || response.statusText));
};

// Session
export function haveSession() {
  return _sessionId;
}

export function setSession(session) {
  _sessionId = session._id;
  _headers.Authorization = `Token token=${session.token}`;
  localStorage.session = JSON.stringify(session);
  return { type: SESSION_LOAD, payload: session };
}

export function clearSession() {
  _sessionId = undefined;
  delete _headers.Authorization;
  localStorage.removeItem('session');
  return { type: SESSION_UNLOAD, payload: undefined };
}

export function loadSession() {
  let session;
  if (localStorage.session) {
    session = JSON.parse(localStorage.session);
    // convert to domainIds
    if (session.userId.administratorDomainId) {
      session.userId.domainIds = [session.userId.administratorDomainId];
      delete session.userId.administratorDomainId;
    } else if (!session.userId.domainIds) {
      session.userId.domainIds = [];
    }
    return setSession(session);
  }
  return clearSession();
}

export function postSession(session) {
  return fetch(
    '/api/sessions',
    { method: 'POST', headers: _headers, body: JSON.stringify(session) },
  )
    .then(processStatus)
    .then(response => response.json());
}

export function postSessionViaToken(session) {
  return fetch(
    '/api/sessions/token',
    { method: 'POST', headers: _headers, body: JSON.stringify(session) },
  )
    .then(processStatus)
    .then(response => response.json());
}

export function deleteSession() {
  return fetch(
    `/api/sessions/${_sessionId}`,
    { method: 'DELETE', headers: _headers },
  )
    .then(processStatus)
    .then(clearSession)
    .catch(clearSession);
}

// Generic

// function cacheAdd(category, item) {
//   dispatch((state) => {
//     const cache = { ...(state[category] || {}) };
//     // also store the id -> path mapping so we can remove cached paths
//     // when we only have an id
//     const paths = { ...(state[`${category}-paths`] || {}) };
//     cache[item._id] = item;
//     if (item.path) {
//       cache[item.path] = item;
//       paths[item._id] = item.path;
//     }
//     const nextState = { ...state };
//     nextState[category] = cache;
//     nextState[`${category}-paths`] = paths;
//     return nextState;
//   });
// }
//
// function cacheRemove(category, item) {
//   dispatch((state) => {
//     const cache = { ...(state[category] || {}) };
//     const paths = { ...(state[`${category}-paths`] || {}) };
//     delete cache[item.path];
//     delete cache[item._id];
//     delete paths[item._id];
//     const nextState = { ...state };
//     nextState[category] = cache;
//     nextState[`${category}-paths`] = paths;
//     return nextState;
//   });
// }

// categoryLoadSequence is used to discard older responses. When the user
// is entering search text, short strings like "s" might take longer to
// process than later strings like "steve". If the response sequence is
// too old, we ignore it.
const categoryLoadSequence = {};

export const loadCategory = (category, options = {}, context) =>
  (dispatch) => {
    const params = [];
    if (options.search) {
      params.push(`search=${encodeURIComponent(options.search)}`);
    }
    if (options.filter) {
      params.push(`filter=${encodeURIComponent(JSON.stringify(options.filter))}`);
    }
    if (options.adminable) {
      params.push('adminable=true');
    }
    if (options.sort) {
      params.push(`sort=${encodeURIComponent(options.sort)}`);
    }
    if (options.select) {
      params.push(`select=${encodeURIComponent(options.select)}`);
    }
    if (options.distinct) {
      params.push(`distinct=${encodeURIComponent(options.distinct)}`);
    }
    if (options.populate) {
      params.push(`populate=${encodeURIComponent(JSON.stringify(options.populate))}`);
    }
    if (options.limit) {
      params.push(`limit=${encodeURIComponent(options.limit)}`);
    }
    if (options.skip) {
      params.push(`skip=${encodeURIComponent(options.skip)}`);
    }
    const q = params.length > 0 ? `?${params.join('&')}` : '';

    if (!categoryLoadSequence[category]) categoryLoadSequence[category] = 1;
    const sequence = categoryLoadSequence[category] + 1;
    categoryLoadSequence[category] = sequence;

    return fetch(
      `/api/${category}${q}`,
      { method: 'GET', headers: _headers },
    )
      .then(processStatus)
      .then(response => response.json())
      .then((items) => {
        if (categoryLoadSequence[category] === sequence) {
          dispatch({
            type: CATEGORY_LOAD,
            payload: {
              category, items, ...options, context,
            },
          });
        }
      })
      .catch(payload => dispatch({
        type: CATEGORY_LOAD, error: true, payload,
      }));
  };

export const unloadCategory = category =>
  ({ type: CATEGORY_UNLOAD, payload: { category } });

export function postItem(category, item) {
  return fetch(
    `/api/${category}`,
    { method: 'POST', headers: _headers, body: JSON.stringify(item) },
  )
    .then(processStatus)
    .then(response => response.json());
}

export const loadItem = (category, id, options = {}) =>
  (dispatch) => {
    const params = [];
    if (options.select) {
      params.push(`select=${encodeURIComponent(options.select)}`);
    }
    if (options.populate) {
      params.push(`populate=${encodeURIComponent(JSON.stringify(options.populate))}`);
    }
    if (options.full) {
      // loads all forms for form template
      params.push(`full=${encodeURIComponent(options.full)}`);
    }
    if (options.totals) {
      // loads totals for form template
      params.push(`totals=${encodeURIComponent(options.totals)}`);
    }
    if (options.new) {
      // includes a new form
      params.push(`new=${encodeURIComponent(options.new)}`);
    }
    if (options.preFill) {
      // when adding a new form, are we adding it as an administrator
      params.push(`preFill=${encodeURIComponent(options.preFill)}`);
    }
    if (options.linkedFormId) {
      params.push(`linkedFormId=${encodeURIComponent(options.linkedFormId)}`);
    }
    if (options.forSession) {
      // loads all forms for form template
      params.push(`forSession=${encodeURIComponent(options.forSession)}`);
    }
    const q = params.length > 0 ? `?${params.join('&')}` : '';
    return fetch(
      `/api/${category}/${encodeURIComponent(id)}${q}`,
      { method: 'GET', headers: _headers },
    )
      .then(processStatus)
      .then(response => response.json())
      .then(item => dispatch({
        type: ITEM_LOAD,
        payload: {
          category, id, item, ...options,
        },
      }))
      .catch(error => dispatch({
        type: ITEM_LOAD,
        error: true,
        payload: { id, error },
      }));
  };

export const unloadItem = (category, id) =>
  ({ type: ITEM_UNLOAD, payload: { category, id } });

export function putItem(category, item) {
  return fetch(
    `/api/${category}/${encodeURIComponent(item._id)}`,
    { method: 'PUT', headers: _headers, body: JSON.stringify(item) },
  )
    .then(processStatus)
    .then(response => response.json());
}

export function deleteItem(category, id) {
  return fetch(
    `/api/${category}/${encodeURIComponent(id)}`,
    { method: 'DELETE', headers: _headers },
  )
    .then(processStatus);
}

// Page

export function getPageMap(id) {
  return fetch(
    `/api/pages/${id}/map`,
    { method: 'GET', headers: _headers },
  )
    .then(response => response.json());
}

export function postPublicize() {
  return fetch(
    '/api/pages/publicize',
    { method: 'POST', headers: _headers },
  )
    .then(processStatus)
    .then(response => response.json());
}

// User

export function postSignUp(user) {
  return fetch(
    '/api/users/sign-up',
    { method: 'POST', headers: _headers, body: JSON.stringify(user) },
  )
    .then(processStatus)
    .then(response => response.json())
    .then(setSession);
}

export function postVerifyEmail(email, returnPath) {
  return fetch(
    '/api/users/verify-email',
    {
      method: 'POST',
      headers: _headers,
      body: JSON.stringify({ email, returnPath }),
    },
  )
    .then(processStatus)
    .then(response => response.json());
}

// Site

export function loadSite() {
  return dispatch =>
    fetch(
      '/api/site',
      { method: 'GET', headers: _headers },
    )
      .then(response => response.json())
      .then((site) => {
        setTimezone(site.timezone);
        return site;
      })
      .then(payload => dispatch({ type: SITE_LOAD, payload }))
      .catch(payload => dispatch({
        type: SITE_LOAD, error: true, payload,
      }));
}

export function postSite(site) {
  return dispatch =>
    fetch(
      '/api/site',
      { method: 'POST', headers: _headers, body: JSON.stringify(site) },
    )
      .then(processStatus)
      .then(response => response.json())
      .then(payload => dispatch({ type: SITE_LOAD, payload }))
      .catch(payload => dispatch({
        type: SITE_LOAD, error: true, payload,
      }));
}

// Calendar

export const loadCalendar = (options = {}) =>
  (dispatch) => {
    const params = [];
    if (options.searchText) {
      params.push(`search=${encodeURIComponent(options.searchText)}`);
    }
    if (options.date) {
      params.push(`date=${encodeURIComponent(options.date.toISOString())}`);
    }
    if (options.months) {
      params.push(`months=${encodeURIComponent(options.months)}`);
    }
    if (options.id) {
      params.push(`id=${encodeURIComponent(options.id)}`);
    }
    if (options.ids) {
      options.ids.forEach((id) => {
        params.push(`id=${encodeURIComponent(id)}`);
      });
    }
    const q = params.length > 0 ? `?${params.join('&')}` : '';
    return fetch(
      `/api/calendar${q}`,
      { method: 'GET', headers: _headers },
    )
      .then(response => response.json())
      .then(payload => dispatch({ type: CALENDAR_LOAD, payload }));
  };

export function unloadCalendar() {
  return { type: CALENDAR_UNLOAD };
}

// Events

export function getResources(event) {
  return fetch(
    '/api/events/resources',
    { method: 'POST', headers: _headers, body: JSON.stringify(event) },
  )
    .then(response => response.json());
}

export function getUnavailableDates(event) {
  return fetch(
    '/api/events/unavailable-dates',
    { method: 'POST', headers: _headers, body: JSON.stringify(event) },
  )
    .then(response => response.json());
}

// Resources

export function getResourceCalendar(resource) {
  return fetch(
    `/api/resources/${resource._id}/calendar`,
    { method: 'GET', headers: _headers },
  )
    .then(response => response.json());
}

export function getResourceEvents(resource) {
  return fetch(
    `/api/resources/${resource._id}/events`,
    { method: 'GET', headers: _headers },
  )
    .then(response => response.json());
}

export function getResourcesCalendar() {
  return fetch(
    '/api/resources/calendar',
    { method: 'GET', headers: _headers },
  )
    .then(response => response.json());
}

export function getResourcesEvents() {
  return fetch(
    '/api/resources/events',
    { method: 'GET', headers: _headers },
  )
    .then(response => response.json());
}

// Forms

export function getFormTemplateDownload(id, options) {
  const params = [];
  if (options.search) {
    params.push(`search=${encodeURIComponent(options.search)}`);
  }
  if (options.filter) {
    params.push(`filter=${encodeURIComponent(JSON.stringify(options.filter))}`);
  }
  if (options.sort) {
    params.push(`sort=${encodeURIComponent(options.sort)}`);
  }
  const q = params.length > 0 ? `?${params.join('&')}` : '';
  return fetch(
    `/api/form-templates/${id}.csv${q}`,
    { method: 'GET', headers: _headers },
  )
    .then((response) => {
      const cd = response.headers.get('Content-Disposition');
      const name = cd && cd.match(/filename="([^"]+)"/)[1];
      response.blob()
        .then(blob => FileSaver.saveAs(blob, name));
      // .then((blob) => {
      //   const blobUrl = URL.createObjectURL(blob);
      //   window.location.replace(blobUrl);
      // });
    });
}

export function postFormTemplateEmailRender(email) {
  return fetch(
    '/api/email/render',
    { method: 'POST', headers: _headers, body: JSON.stringify(email) },
  )
    .then(processStatus)
    .then(response => response.text());
}

export function postFormTemplateEmailSend(id, email) {
  return fetch(
    `/api/form-templates/${id}/email`,
    { method: 'POST', headers: _headers, body: JSON.stringify(email) },
  )
    .then(processStatus)
    .then(response => response.text());
}

// Newsletter

export function postNewsletterRender(newsletter) {
  return fetch(
    '/api/newsletters/render',
    { method: 'POST', headers: _headers, body: JSON.stringify(newsletter) },
  )
    .then(processStatus)
    .then(response => response.text());
}

export function postNewsletterSend(id, address) {
  return fetch(
    `/api/newsletters/${id}/send`,
    { method: 'POST', headers: _headers, body: JSON.stringify({ address }) },
  )
    .then(processStatus)
    .then(response => response.text());
}

// Map

export function getGeocode(address) {
  const query = `?q=${encodeURIComponent(address)}&format=json`;
  const url =
    `${window.location.protocol}//nominatim.openstreetmap.org/search${query}`;
  return fetch(
    url,
    { method: 'GET', headers: { ..._headers, Authorization: undefined } },
  )
    .then(response => response.json());
}

// Files

export function postFile(data) {
  const headers = { ..._headers };
  delete headers['Content-Type'];
  return fetch(
    '/api/files',
    { method: 'POST', headers, body: data },
  )
    .then(processStatus)
    .then(response => response.json());
}

export function deleteFile(id) {
  return fetch(
    `/api/files/${id}`,
    { method: 'DELETE', headers: _headers },
  )
    .then(processStatus);
}

// Email lists

export function postSubscribe(emailList, addresses) {
  return fetch(
    `/api/email-lists/${emailList._id}/subscribe`,
    { method: 'POST', headers: _headers, body: JSON.stringify(addresses) },
  )
    .then(processStatus);
}

export function postUnsubscribe(emailList, addresses) {
  return fetch(
    `/api/email-lists/${emailList._id}/unsubscribe`,
    { method: 'POST', headers: _headers, body: JSON.stringify(addresses) },
  )
    .then(processStatus);
}

export function getEmailListDownload(emailList) {
  return fetch(
    `/api/email-lists/${emailList._id}.txt`,
    { method: 'GET', headers: _headers },
  )
    .then((response) => {
      const cd = response.headers.get('Content-Disposition');
      const name = cd && cd.match(/filename="([^"]+)"/)[1];
      response.blob()
        .then(blob => FileSaver.saveAs(blob, name));
    });
}

export function putMessage(url) {
  return fetch(
    url,
    { method: 'PUT', headers: _headers },
  )
    .then(processStatus);
}

export function deleteMessage(url) {
  return fetch(
    url,
    { method: 'DELETE', headers: _headers },
  )
    .then(processStatus);
}

// Search

export const loadSearch = searchText =>
  (dispatch) => {
    if (searchText) {
      const params = [];
      params.push(`search=${encodeURIComponent(searchText)}`);
      const q = params.length > 0 ? `?${params.join('&')}` : '';
      return fetch(
        `/api/search${q}`,
        { method: 'GET', headers: _headers },
      )
        .then(processStatus)
        .then(response => response.json())
        .then(payload => dispatch({ type: SEARCH_LOAD, payload }))
        .catch(payload => dispatch({
          type: SEARCH_LOAD, error: true, payload,
        }));
    }
    return dispatch({ type: SEARCH_LOAD, payload: {} });
  };

export const unloadSearch = () => ({ type: SEARCH_UNLOAD });

// Audit Log

export const loadAuditLog = (options = {}) =>
  (dispatch) => {
    const params = [];
    if (options.limit) {
      params.push(`limit=${encodeURIComponent(options.limit)}`);
    }
    if (options.skip) {
      params.push(`skip=${encodeURIComponent(options.skip)}`);
    }
    const q = params.length > 0 ? `?${params.join('&')}` : '';
    fetch(
      `/api/audit-log${q}`,
      { method: 'GET', headers: _headers },
    )
      .then(processStatus)
      .then(response => response.json())
      .then(items => dispatch({
        type: AUDIT_LOG_LOAD, payload: { items, ...options },
      }))
      .catch(payload => dispatch({
        type: AUDIT_LOG_LOAD, error: true, payload,
      }));
  };

export const unloadAuditLog = () => ({ type: AUDIT_LOG_UNLOAD });
