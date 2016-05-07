"use strict";
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { getItem } from '../actions';
import PageHeader from './PageHeader';

export default class Show extends Component {

  constructor () {
    super();
    this.state = { item: {} };
  }

  componentDidMount () {
    getItem(this.props.category, this.props.params.id)
      .then(response => this.setState({ item: response }));
  }

  _renderContents (item) {
    // override
  }

  render () {
    const { category } = this.props;
    const { item } = this.state;
    const editControl = (
      <Link to={`/${category}/${item._id}/edit`} className="a--header">Edit</Link>
    );
    return (
      <main>
        <PageHeader title={item.name || '-'} back={true} actions={editControl} />
        {this._renderContents(item)}
      </main>
    );
  }
};

Show.propTypes = {
  category: PropTypes.string.isRequired,
  params: PropTypes.shape({
    id: PropTypes.string.isRequired
  }).isRequired
};
