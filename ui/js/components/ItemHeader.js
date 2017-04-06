import React, { Component, PropTypes } from 'react';
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
    const { category, item, title, session } = this.props;
    let { actions } = this.props;

    if (item && session && (session.userId.administrator ||
      (session.userId.administratorDomainId &&
        session.userId.administratorDomainId === item.domainId))) {
      actions = [...actions,
        <a key="copy" href={`/${category}/add`} onClick={this._onCopy}>
          Copy
        </a>,
        <Link key="edit" to={`/${category}/${item._id}/edit`}>
          Edit
        </Link>,
      ];
    }

    return (
      <PageHeader title={title} homer={true} actions={actions} />
    );
  }
}

ItemHeader.propTypes = {
  actions: PropTypes.arrayOf(PropTypes.element),
  category: PropTypes.string.isRequired,
  item: PropTypes.object,
  session: PropTypes.shape({
    userId: PropTypes.shape({
      administrator: PropTypes.bool,
      administratorDomainId: PropTypes.string,
    }),
  }),
  title: PropTypes.string,
};

ItemHeader.defaultProps = {
  actions: [],
  item: undefined,
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
