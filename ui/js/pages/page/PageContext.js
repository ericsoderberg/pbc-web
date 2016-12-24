"use strict";
import React, { Component, PropTypes } from 'react';
import { getItems } from '../../actions';
import PageItem from './PageItem';

export default class PageContext extends Component {

  constructor () {
    super();
    this.state = { pages: [] };
  }

  componentDidMount () {
    this._load(this.props);
  }

  componentWillReceiveProps (nextProps) {
    this._load(nextProps);
  }

  _load (props) {
    const { filter } = props;
    if (filter) {
      getItems('pages', {
        filter: filter,
        select: 'name'
      })
      .then(pages => this.setState({ pages: pages }))
      .catch(error => console.log('!!! PageContext pages catch', error));
    }
  }

  render () {
    const { pages } = this.state;
    let result = null;
    if (pages.length > 0) {
      const pageItems = pages.map(page => (
        <li key={page._id}>
          <PageItem item={page} />
        </li>
      ));
      result = (
        <ul className="list">
          {pageItems}
        </ul>
      );
    }
    return result;
  };
}

PageContext.propTypes = {
  filter: PropTypes.object
};
