
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { loadCategory, unloadCategory } from '../../actions';
import PageItem from './PageItem';

class PageContext extends Component {

  componentDidMount() {
    const { filter } = this.props;
    if (filter) {
      this._load(this.props);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { filter } = nextProps;
    if (filter && (!this.props.filter ||
      JSON.stringify(filter) !== JSON.stringify(this.props.filter))) {
      this._load(nextProps);
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch(unloadCategory('pages'));
  }

  _load(props) {
    const { dispatch, filter } = props;
    dispatch(loadCategory('pages', {
      filter: { public: true, ...filter },
      select: 'name path',
    }));
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
