"use strict";
import React, { Component, PropTypes } from 'react';
import { getItem } from '../actions';
import ItemHeader from './ItemHeader';
import Loading from './Loading';

export default class Show extends Component {

  constructor () {
    super();
    this.state = {};
  }

  componentDidMount () {
    this._load(this.props);
  }

  componentWillReceiveProps (nextProps) {
    if ((nextProps.category !== this.props.category ||
      nextProps.params.id !== this.props.params.id)) {
      this._load(nextProps);
    }
  }

  _load (props) {
    if (props.item) {
      document.title = props.item.name;
      this.setState({ item: props.item });
    } else {
      this.setState({ item: undefined });
      getItem(props.category, props.params.id)
      .then(item => {
        document.title = item.name;
        this.setState({ item: item });
      })
      .catch(error => console.log('!!! Show catch', error));
    }
  }

  render () {
    const { actions, category, Contents, title } = this.props;
    const { item } = this.state;

    let contents;
    if (item) {
      contents = <Contents item={item} />;
    } else {
      contents = <Loading />;
    }

    return (
      <main>
        <ItemHeader title={title} category={category} item={item}
          actions={actions} />
        {contents}
      </main>
    );
  }
};

Show.propTypes = {
  actions: PropTypes.arrayOf(PropTypes.element),
  category: PropTypes.string.isRequired,
  Contents: PropTypes.func.isRequired,
  item: PropTypes.object,
  params: PropTypes.shape({
    id: PropTypes.string.isRequired
  }),
  title: PropTypes.string
};

Show.contextTypes = {
  router: PropTypes.any
};
