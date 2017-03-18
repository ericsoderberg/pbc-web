import React, { Component, PropTypes } from 'react';
import { getItem } from '../../actions';
import ItemHeader from '../../components/ItemHeader';
import Loading from '../../components/Loading';
import ResourceContents from './ResourceContents';

export default class Resource extends Component {

  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {
    this._load(this.props.params.id);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.params.id !== this.props.params.id) {
      this._load(nextProps.params.id);
    }
  }

  _load(id) {
    getItem('resources', id, { populate: true })
    .then((resource) => {
      document.title = resource.name;
      this.setState({ resource });
    })
    .catch(error => console.error('!!! Resource catch', error));
  }

  render() {
    const { resource } = this.state;
    let contents;
    let actions;
    if (resource) {
      contents = <ResourceContents item={resource} />;
    } else {
      contents = <Loading />;
    }

    return (
      <main>
        <ItemHeader category="resources" title={(resource || {}).name}
          item={resource} actions={actions} />
        {contents}
      </main>
    );
  }
}

Resource.propTypes = {
  params: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
};
