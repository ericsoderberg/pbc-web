import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { loadItem, unloadItem } from '../actions';
import ItemHeader from './ItemHeader';
import Loading from './Loading';
import NotFound from './NotFound';

class Show extends Component {

  componentDidMount() {
    this._load(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if ((nextProps.category !== this.props.category ||
      nextProps.id !== this.props.id || !nextProps.item)) {
      this._load(nextProps);
    }
    if (nextProps.item) {
      document.title = nextProps.item.name;
    }
  }

  componentWillUnmount() {
    const { category, dispatch, id } = this.props;
    dispatch(unloadItem(category, id));
  }

  _load(props) {
    const {
      category, dispatch, id, item,
    } = props;
    if (item) {
      document.title = item.name;
    } else {
      dispatch(loadItem(category, id));
    }
  }

  render() {
    const {
      actions, category, Contents, item, notFound, title,
    } = this.props;

    let contents;
    if (item) {
      contents = <Contents item={item} />;
    } else if (notFound) {
      contents = <NotFound />;
    } else {
      contents = <Loading />;
    }

    return (
      <main>
        <ItemHeader title={title}
          category={category}
          item={item}
          actions={actions} />
        {contents}
      </main>
    );
  }
}

Show.propTypes = {
  actions: PropTypes.arrayOf(PropTypes.element),
  category: PropTypes.string.isRequired,
  Contents: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  item: PropTypes.object,
  notFound: PropTypes.bool,
  title: PropTypes.string,
};

Show.defaultProps = {
  actions: [],
  item: undefined,
  notFound: false,
  title: undefined,
};

Show.contextTypes = {
  router: PropTypes.any,
};

const select = (state, props) => ({
  id: props.match.params.id,
  item: state[props.match.params.id],
  notFound: state.notFound[props.match.params.id],
});

export default connect(select)(Show);
