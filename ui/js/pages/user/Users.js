"use strict";
import React, { Component } from 'react';
import { Link } from 'react-router';
import { getUsers } from '../../actions';
import PageHeader from '../../components/PageHeader';

export default class Users extends Component {

  constructor () {
    super();
    this._onSearch = this._onSearch.bind(this);
    this.state = { users: [], searchText: '' };
  }

  componentDidMount () {
    getUsers()
      .then(response => this.setState({ users: response }));
  }

  _onSearch (event) {
    const searchText = event.target.value;
    clearTimeout(this._searchTimer);
    this._searchTimer = setTimeout(() => {
      getUsers(searchText)
        .then(response => this.setState({ users: response }));
    }, 100);
    this.setState({ searchText: searchText });
  }

  render () {
    const { searchText } = this.props;

    const users = this.state.users.map(user => {
      const admin = user.administrator ? ' *' : undefined;
      return (
        <li key={user._id} >
          <Link className="item" to={`/users/${user._id}`}>
            <span className="box--row">
              <img className="avatar" src={user.avatar ? user.avatar.data : ''} />
              <span>{user.name}</span>
              <span>{admin}</span>
            </span>
            <span>{user.email}</span>
          </Link>
        </li>
      );
    });

    const addControl = (
      <Link to="/users/add" className="a--header">Add</Link>
    );

    return (
      <main>
        <PageHeader title="Users"
          searchText={searchText} onSearch={this._onSearch}
          actions={addControl} />
        <ul className="items">
          {users}
        </ul>
      </main>
    );
  }
};
