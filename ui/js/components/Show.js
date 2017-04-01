import React, { Component, PropTypes } from 'react';
import { getItem } from '../actions';
import ItemHeader from './ItemHeader';
import Loading from './Loading';

export default class Show extends Component {

  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {
    this._load(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if ((nextProps.category !== this.props.category ||
      nextProps.match.params.id !== this.props.match.params.id)) {
      this._load(nextProps);
    }
  }

  _load(props) {
    const { category, item, match } = props;
    if (item) {
      document.title = item.name;
      this.setState({ item });
    } else {
      this.setState({ item: undefined });
      getItem(category, match.params.id)
      .then((itemLoaded) => {
        document.title = itemLoaded.name;
        this.setState({ item: itemLoaded });
      })
      .catch(error => console.error('!!! Show catch', error));
    }
  }

  render() {
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
}

Show.propTypes = {
  actions: PropTypes.arrayOf(PropTypes.element),
  category: PropTypes.string.isRequired,
  Contents: PropTypes.func.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  title: PropTypes.string,
};

Show.defaultProps = {
  actions: [],
  title: undefined,
};

Show.contextTypes = {
  router: PropTypes.any,
};
