import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { postItem } from '../actions';
import PageHeader from './PageHeader';

class ItemHeader extends Component {

  constructor() {
    super();
    this._onCopy = this._onCopy.bind(this);
    this.state = {};
  }

  _onCopy(event) {
    event.preventDefault();
    const { category, item } = this.props;
    const { router } = this.context;
    const copyItem = { ...item };
    copyItem.name += ' - Copy';
    delete copyItem._id;
    delete copyItem.path;
    postItem(category, copyItem)
      .then((newItem) => {
        router.history.push(`/${category}/${newItem._id}/edit`);
      })
      .catch(error => console.error('!!! ItemHeader catch', error));
  }

  render() {
    const {
      category, filters, item, onSearch, searchText, title, session,
    } = this.props;
    let { actions } = this.props;

    if (item && session) {
      if (session.userId.administrator ||
        (session.userId.domainIds &&
          session.userId.domainIds.some(id => id === item.domainId))) {
        actions = [...actions,
          <a key="copy" href={`/${category}/add`} onClick={this._onCopy}>
            Copy
          </a>,
          <Link key="edit" to={`/${category}/${item._id}/edit`}>
            Edit
          </Link>,
        ];
      } else if (item._id === session.userId._id) {
        actions = [
          <Link key="edit" to={`/${category}/${item._id}/edit`}>
            Edit
          </Link>,
        ];
      }
    }

    return (
      <PageHeader title={title}
        homer={true}
        actions={actions}
        searchText={searchText}
        onSearch={onSearch}
        filters={filters} />
    );
  }
}

ItemHeader.propTypes = {
  actions: PropTypes.arrayOf(PropTypes.element),
  category: PropTypes.string.isRequired,
  filters: PropTypes.arrayOf(PropTypes.node),
  item: PropTypes.object,
  onSearch: PropTypes.func,
  searchText: PropTypes.string,
  session: PropTypes.shape({
    userId: PropTypes.shape({
      administrator: PropTypes.bool,
      domainIds: PropTypes.arrayOf(PropTypes.string),
    }),
  }),
  title: PropTypes.string,
};

ItemHeader.defaultProps = {
  actions: [],
  filters: undefined,
  item: undefined,
  onSearch: undefined,
  searchText: undefined,
  session: undefined,
  title: undefined,
};

ItemHeader.contextTypes = {
  router: PropTypes.any,
};

const select = state => ({
  session: state.session,
});

export default connect(select)(ItemHeader);
