import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router-dom';
import { getItem } from '../../actions';
import Edit from '../../components/Edit';
import Stored from '../../components/Stored';
import UserFormContents from './UserFormContents';

class UserEdit extends Component {

  componentDidMount() {
    this._load(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.match.params.id !== this.props.match.params.id) {
      this._load(nextProps);
    }
  }

  _load(props) {
    if (!props.user) {
      getItem('users', props.match.params.id, { cache: true, populate: true })
      .catch(error => console.error('!!! UserEdit catch', error));
    }
  }

  render() {
    const { match, user } = this.props;
    const id = encodeURIComponent(match.params.id);
    const name = encodeURIComponent((user || {}).name);
    const email = encodeURIComponent((user || {}).email);
    const formsPath = `/forms?userId=${id}&userId-name=${name}`;
    const emailListsPath = `/email-lists?addresses.address=${email}&addresses-name=${email}`;
    const actions = [
      <Link key="forms" to={formsPath}>Forms</Link>,
      <Link key="email" to={emailListsPath}>Email lists</Link>,
    ];
    return (
      <Edit title="Edit Account" category="users" match={match}
        actions={actions} FormContents={UserFormContents}
        onChange={this._onChange} />
    );
  }
}

UserEdit.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
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
    user = state.users[props.match.params.id];
  }
  return { user };
};

export default Stored(UserEdit, select);
