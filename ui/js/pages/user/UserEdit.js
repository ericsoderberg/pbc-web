import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { loadItem, unloadItem } from '../../actions';
import Edit from '../../components/Edit';
import UserFormContents from './UserFormContents';

class UserEdit extends Component {

  componentDidMount() {
    const { user } = this.props;
    if (!user) {
      this._load(this.props);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.id !== this.props.id) {
      this._load(nextProps);
    }
    if (nextProps.user) {
      document.title = `Edit ${nextProps.user.name}`;
    }
  }

  componentWillUnmount() {
    const { dispatch, id } = this.props;
    dispatch(unloadItem('users', id));
  }

  _load(props) {
    const { dispatch, id } = props;
    dispatch(loadItem('users', id, { populate: true }));
  }

  render() {
    const { id, user } = this.props;
    return (
      <Edit title="Edit Account"
        category="users"
        id={id}
        item={user}
        FormContents={UserFormContents} />
    );
  }
}

UserEdit.propTypes = {
  dispatch: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  user: PropTypes.object,
};

UserEdit.defaultProps = {
  user: {},
};

const select = (state, props) => ({
  id: props.match.params.id,
  user: state[props.match.params.id],
});

export default connect(select)(UserEdit);
