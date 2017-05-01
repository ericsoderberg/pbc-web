import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { loadItem, unloadItem } from '../../actions';
import ItemHeader from '../../components/ItemHeader';
import Loading from '../../components/Loading';
import ResourceContents from './ResourceContents';

class Resource extends Component {

  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {
    this._load(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.id !== this.props.id) {
      this._load(nextProps);
    }
    if (nextProps.resource) {
      document.title = nextProps.resource.name;
    }
  }

  componentWillUnmount() {
    const { dispatch, id } = this.props;
    dispatch(unloadItem('resources', id));
  }

  _load(props) {
    const { dispatch, id } = props;
    dispatch(loadItem('resources', id, { populate: true }));
  }

  render() {
    const { resource } = this.props;
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
  dispatch: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  resource: PropTypes.object,
};

Resource.defaultProps = {
  resource: undefined,
};

const select = (state, props) => ({
  id: props.match.params.id,
  resource: state[props.match.params.id],
  session: state.session,
});

export default connect(select)(Resource);
