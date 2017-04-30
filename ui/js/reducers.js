// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import {
  AUDIT_LOG_LOAD, AUDIT_LOG_UNLOAD,
  CALENDAR_LOAD, CALENDAR_UNLOAD,
  CATEGORY_LOAD, CATEGORY_UNLOAD,
  ITEM_LOAD, ITEM_UNLOAD,
  SEARCH_LOAD, SEARCH_UNLOAD,
  SESSION_LOAD, SESSION_UNLOAD,
  SITE_LOAD, SITE_UNLOAD,
} from './actions';

const initialState = {
  cache: {}, // _id -> item
  notFound: {}, // _id -> true
};

const loader = (field, state, action) => {
  const nextState = {};
  if (!action.error) {
    // action.payload.error = undefined;
    nextState[field] = action.payload;
  } else {
    nextState[field] = false;
    nextState.error = action.payload;
  }
  return nextState;
};

const handlers = {
  [AUDIT_LOG_LOAD]: (state, action) => {
    const nextState = {};
    if (!action.error) {
      action.payload.error = undefined;
      const auditLog = action.payload;
      let items = auditLog.items;
      const mightHaveMore = items.length === 20;
      if (auditLog.skip) {
        items = state.auditLog.items.concat(items);
      }
      nextState.auditLog = { items, mightHaveMore };
    } else {
      nextState.error = action.payload;
    }
    return nextState;
  },
  [AUDIT_LOG_UNLOAD]: () => ({ auditLog: undefined }),

  [CALENDAR_LOAD]: (state, action) => loader('calendar', state, action),
  [CALENDAR_UNLOAD]: () => ({ calendar: undefined }),

  [CATEGORY_LOAD]: (state, action) => {
    const nextState = {};
    if (!action.error) {
      action.payload.error = undefined;
      const { category, skip } = action.payload;
      let { items } = action.payload;
      const mightHaveMore = items.length === 20;
      if (skip) {
        items = state[category].items.concat(items);
      }
      nextState[category] = { items, mightHaveMore };
    } else {
      nextState.error = action.payload;
    }
    return nextState;
  },
  [CATEGORY_UNLOAD]: (state, action) => {
    const nextState = {};
    nextState[action.payload.category] = undefined;
    return nextState;
  },

  [ITEM_LOAD]: (state, action) => {
    const nextState = { notFound: { ...state.notFound } };
    if (!action.error) {
      action.payload.error = undefined;
      const { id, item } = action.payload;
      nextState[id] = item;
    } else {
      nextState.notFound[action.payload.id] = true;
      nextState.error = action.payload.error;
    }
    return nextState;
  },
  [ITEM_UNLOAD]: (state, action) => {
    const nextState = {};
    nextState[action.payload.id] = undefined;
    nextState.notFound = { ...state.notFound };
    delete nextState.notFound[action.payload.id];
    return nextState;
  },

  [SEARCH_LOAD]: (state, action) => loader('search', state, action),
  [SEARCH_UNLOAD]: () => ({ search: undefined }),

  [SESSION_LOAD]: (state, action) => loader('session', state, action),
  [SESSION_UNLOAD]: () => ({ session: undefined }),

  [SITE_LOAD]: (state, action) => loader('site', state, action),
  [SITE_UNLOAD]: () => ({ site: undefined }),
};

export default function (state = initialState, action) {
  const handler = handlers[action.type];
  if (!handler) return state;
  return { ...state, ...handler(state, action) };
}
