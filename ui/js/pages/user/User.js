"use strict";
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { getUser } from '../../actions';
import PageHeader from '../../components/PageHeader';

export default class User extends Component {

  constructor () {
    super();
    this.state = { user: {} };
  }

  componentDidMount () {
    getUser(this.props.params.id)
      .then(response => this.setState({ user: response }));
  }

  render () {
    const { user } = this.state;
    const editControl = (
      <Link to={`/users/${user._id}/edit`} className="a--header">Edit</Link>
    );
    return (
      <main>
        <PageHeader title={user.name || '-'} back={true} actions={editControl} />
        <img className="avatar" src={user.avatar ? user.avatar.data : ''} />
        {user.email}
      </main>
    );
  }
};

User.contextTypes = {
  router: PropTypes.any
};
