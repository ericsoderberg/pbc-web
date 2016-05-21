"use strict";
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { getItem } from '../actions';
import PageHeader from './PageHeader';
import Stored from './Stored';

class Show extends Component {

  constructor () {
    super();
    this.state = { item: {} };
  }

  componentDidMount () {
    this._load(this.props);
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.category !== this.props.category ||
      nextProps.params.id !== this.props.params.id) {
      this._load(nextProps);
    }
  }

  _load (props) {
    getItem(props.category, props.params.id)
    .then(item => {
      document.title = item.name;
      this.setState({ item: item });
    })
    .catch(error => console.log('!!! Show catch', error));
  }

  render () {
    const { category, Contents, title, session } = this.props;
    const { item } = this.state;

    let editControl;
    if (session && session.administrator) {
      editControl = (
        <Link to={`/${category}/${item._id}/edit`} className="a--header">Edit</Link>
      );
    }

    return (
      <main>
        <PageHeader title={title} back={true} actions={editControl} />
        <Contents item={item} />
      </main>
    );
  }
};

Show.propTypes = {
  category: PropTypes.string.isRequired,
  Contents: PropTypes.func.isRequired,
  params: PropTypes.shape({
    id: PropTypes.string.isRequired
  }).isRequired,
  session: PropTypes.shape({
    administrator: PropTypes.bool
  }),
  title: PropTypes.string
};

const select = (state, props) => ({
  session: state.session
});

export default Stored(Show, select);
