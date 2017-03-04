
import React, { Component, PropTypes } from 'react';
import { getItems } from '../../actions';
import PageItem from './PageItem';

export default class PageContext extends Component {

  constructor() {
    super();
    this.state = { pages: [] };
  }

  componentDidMount() {
    this._load(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this._load(nextProps);
  }

  componentWillUnmount() {
    this._unmounted = true;
  }

  _load(props) {
    const { filter } = props;
    if (filter) {
      getItems('pages', {
        filter: { public: true, ...filter },
        select: 'name path',
      })
      .then((pages) => {
        if (!this._unmounted) {
          this.setState({ pages });
        }
      })
      .catch(error => console.error('!!! PageContext pages catch', error));
    }
  }

  render() {
    const { align } = this.props;
    const { pages } = this.state;
    let result = null;
    if (pages.length > 0) {
      const pageItems = pages.map(page => (
        <li key={page._id}>
          <PageItem align={align} item={page} />
        </li>
      ));
      result = (
        <ul className="page-context list">
          {pageItems}
        </ul>
      );
    }
    return result;
  }
}

PageContext.propTypes = {
  align: PropTypes.oneOf(['start', 'center', 'end']),
  filter: PropTypes.object,
};

PageContext.defaultProps = {
  align: 'center',
  filter: undefined,
};
