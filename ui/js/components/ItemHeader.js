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
    let { actions } = this.props;

    if (item && session && (session.administrator ||
      (session.administratorDomainId &&
        session.administratorDomainId === item.domainId))) {
      actions = [ ...actions,
        <a key="copy" href={`/${category}/add`} onClick={this._onCopy}>
          Copy
        </a>,
        <Link key="edit" to={`/${category}/${item._id}/edit`}>
          Edit
        </Link>
      ];
    }

    return (
      <PageHeader title={title} homer={true} actions={actions} />
    );
  }
};

ItemHeader.propTypes = {
  actions: PropTypes.arrayOf(PropTypes.element),
  category: PropTypes.string.isRequired,
  item: PropTypes.object,
  session: PropTypes.shape({
    administrator: PropTypes.bool,
    administratorDomainId: PropTypes.string
  }),
  title: PropTypes.string
};

ItemHeader.defaultProps = {
  actions: []
};

ItemHeader.contextTypes = {
  router: PropTypes.any
};

const select = (state, props) => ({
  session: state.session
});

export default Stored(ItemHeader, select);
