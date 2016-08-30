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
    delete copyItem.path;
    postItem(category, copyItem)
    .then(newItem => {
      this.context.router.push(`/${category}/${newItem._id}/edit`);
    })
    .catch(error => console.log('!!! ItemHeader catch', error));
  }

  render () {
    const { category, item, title, session } = this.props;

    let actions;
    if (item && session && (session.administrator ||
      (session.administratorDomainId &&
        session.administratorDomainId === item.domainId))) {
      actions = (
        <nav className="page-header__actions">
          {this.props.actions}
          <a href={`/${category}/add`} className="a-header"
            onClick={this._onCopy}>
            Copy
          </a>
          <Link to={`/${category}/${item._id}/edit`}
            className="a-header">
            Edit
          </Link>
        </nav>
      );
    }

    return (
      <PageHeader title={title} back={true} actions={actions} />
    );
  }
};

ItemHeader.propTypes = {
  actions: PropTypes.node,
  category: PropTypes.string.isRequired,
  item: PropTypes.object,
  session: PropTypes.shape({
    administrator: PropTypes.bool,
    administratorDomainId: PropTypes.string
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
