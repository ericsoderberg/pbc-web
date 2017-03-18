import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { getItem } from '../../actions';
import Edit from '../../components/Edit';
import Stored from '../../components/Stored';
import UserFormContents from './UserFormContents';

class UserEdit extends Component {

  componentDidMount() {
    if (!this.props.user) {
      getItem('users', this.props.params.id, { cache: true, populate: true })
      .catch(error => console.error('!!! UserEdit catch', error));
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.params.id !== this.props.params.id &&
      !nextProps.user) {
      getItem('users', nextProps.params.id, { cache: true, populate: true })
      .catch(error => console.error('!!! UserEdit catch', error));
    }
  }

  render() {
    const { params, user } = this.props;
    const id = encodeURIComponent(params.id);
    const name = encodeURIComponent((user || {}).name);
    const email = encodeURIComponent((user || {}).email);
    const formsPath = `/forms?userId=${id}&userId-name=${name}`;
    const emailListsPath = `/email-lists?addresses.address=${email}&addresses-name=${email}`;
    const actions = [
      <Link key="forms" to={formsPath}>Forms</Link>,
      <Link key="email" to={emailListsPath}>Email lists</Link>,
    ];
    return (
      <Edit title="Edit Account" category="users" params={params}
        actions={actions} FormContents={UserFormContents}
        onChange={this._onChange} />
    );
  }
}

UserEdit.propTypes = {
  params: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
  user: PropTypes.object,
};

UserEdit.defaultProps = {
  user: undefined,
};

UserEdit.contextTypes = {
  router: PropTypes.any,
};

const select = (state, props) => {
  let user;
  if (state.users) {
    user = state.users[props.params.id];
  }
  return { user };
};

export default Stored(UserEdit, select);
