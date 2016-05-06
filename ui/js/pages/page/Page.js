"use strict";
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { getItem } from '../../actions';
import PageHeader from '../../components/PageHeader';

export default class Page extends Component {

  constructor () {
    super();
    this.state = { page: {} };
  }

  componentDidMount () {
    getItem('pages', this.props.params.id)
      .then(response => this.setState({ page: response }));
  }

  render () {
    const { page } = this.state;
    const editControl = (
      <Link to={`/pages/${page._id}/edit`} className="a--header">Edit</Link>
    );
    return (
      <main>
        <PageHeader title={page.name || '-'} back={true} actions={editControl} />
      </main>
    );
  }
};

Page.contextTypes = {
  router: PropTypes.any
};
