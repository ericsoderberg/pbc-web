"use strict";
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { postItem } from '../actions';
import PageHeader from './PageHeader';
import Stored from './Stored';

class ItemHeader extends Component {

  constructor () {
    super();
    this._onCopy = this._onCopy.bind(this);
    this.state = {};
  }

  _onCopy (event) {
    event.preventDefault();
    const { category, item } = this.props;
    const copyItem = { ...item };
    copyItem.name += ' - Copy';
    delete copyItem._id;
    postItem(category, copyItem)
    .then(newItem => {
      this.context.router.push(`/${category}/${newItem._id}/edit`);
    })
    .catch(error => console.log('!!! ItemHeader catch', error));
  }

  render () {
    const { category, item, title, session } = this.props;

    let controls;
    if (item && session && session.administrator) {
      controls = [
        <a key="copy" href={`/${category}/add`} className="a-header"
          onClick={this._onCopy}>
          Copy
        </a>,
        <Link key="edit" to={`/${category}/${item.path || item._id}/edit`}
          className="a-header">
          Edit
        </Link>
      ];
    }

    return (
      <PageHeader title={title} back={true} actions={controls} />
    );
  }
};

ItemHeader.propTypes = {
  category: PropTypes.string.isRequired,
  item: PropTypes.object,
  session: PropTypes.shape({
    administrator: PropTypes.bool
  }),
  title: PropTypes.string
};

ItemHeader.contextTypes = {
  router: PropTypes.any
};

const select = (state, props) => ({
  session: state.session
});

export default Stored(ItemHeader, select);
