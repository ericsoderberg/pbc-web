
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { loadCategory, unloadCategory } from '../../actions';
import PageItem from './PageItem';

class PageContext extends Component {

  componentDidMount() {
    this._load(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.pages && nextProps.filter) {
      this._load(nextProps);
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch(unloadCategory('pages'));
  }

  _load(props) {
    const { dispatch, filter } = props;
    if (filter) {
      dispatch(loadCategory('pages', {
        filter: { public: true, ...filter },
        select: 'name path',
      }));
    }
  }

  render() {
    const { align, pages } = this.props;
    let result = null;
    if (pages && pages.length > 0) {
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
  dispatch: PropTypes.func.isRequired,
  filter: PropTypes.object,
  pages: PropTypes.array,
};

PageContext.defaultProps = {
  align: 'center',
  filter: undefined,
  pages: undefined,
};

const select = state => ({
  pages: (state.pages || {}).items,
});

export default connect(select)(PageContext);
