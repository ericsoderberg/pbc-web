import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Edit from '../../components/Edit';
import UserFormContents from './UserFormContents';

class UserEdit extends Component {

  componentWillReceiveProps(nextProps) {
    if (nextProps.user) {
      document.title = `Edit ${nextProps.user.name}`;
    }
  }

  render() {
    const { id } = this.props;
    return (
      <Edit title="Edit Account"
        category="users"
        id={id}
        FormContents={UserFormContents}
        postRemovePath="/users" />
    );
  }
}

UserEdit.propTypes = {
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
