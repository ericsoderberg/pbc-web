"use strict";
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { getItem, postItem } from '../actions';
import PageHeader from './PageHeader';
import Stored from './Stored';
import Loading from './Loading';

class Show extends Component {

  constructor () {
    super();
    this._onCopy = this._onCopy.bind(this);
    this.state = { };
  }

  componentDidMount () {
    this._load(this.props);
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.category !== this.props.category ||
      nextProps.params.id !== this.props.params.id) {
      this.setState({ item: undefined });
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

  _onCopy (event) {
    event.preventDefault();
    const { category } = this.props;
    const copyItem = { ...this.state.item };
    copyItem.name += ' - Copy';
    delete copyItem._id;
    postItem(category, copyItem)
    .then(newItem => {
      this.context.router.push(`/${category}/${newItem._id}/edit`);
    })
    .catch(error => this.setState({ error: error }));
  }

  render () {
    const { category, Contents, title, session } = this.props;
    const { item } = this.state;

    let controls;
    if (item && session && session.administrator) {
      controls = [
        <a key="copy" href={`/${category}/add`} className="a-header"
          onClick={this._onCopy}>
          Copy
        </a>,
        <Link key="edit" to={`/${category}/${item._id}/edit`}
          className="a-header">
          Edit
        </Link>
      ];
    }

    let contents;
    if (item) {
      contents = <Contents item={item} />;
    } else {
      contents = <Loading />;
    }

    return (
      <main>
        <PageHeader title={title} back={true} actions={controls} />
        {contents}
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

Show.contextTypes = {
  router: PropTypes.any
};

const select = (state, props) => ({
  session: state.session
});

export default Stored(Show, select);
