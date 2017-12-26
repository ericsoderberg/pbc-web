
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { loadCategory, unloadCategory } from '../actions';
import PageItem from '../pages/page/PageItem';
import EventItem from '../pages/event/EventItem';

class ItemContext extends Component {

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
    dispatch(unloadCategory('events'));
  }

  _load(props) {
    const { dispatch, filter } = props;
    dispatch(loadCategory('pages', {
      filter: { public: true, ...filter },
      select: 'name path',
    }));
    dispatch(loadCategory('events', {
      filter: { public: true, ...filter },
      select: 'name path start stop allDay dates',
    }));
  }

  render() {
    const { align, events, pages } = this.props;
    const pageItems = (pages || []).map(page => (
      <li key={page._id}>
        <PageItem align={align} item={page} />
      </li>
    ));
    const eventItems = (events || []).map(event => (
      <li key={event._id}>
        <EventItem align={align} item={event} />
      </li>
    ));
    return (
      <ul className="page-context list">
        {pageItems}
        {eventItems}
      </ul>
    );
  }
}

ItemContext.propTypes = {
  align: PropTypes.oneOf(['start', 'center', 'end']),
  dispatch: PropTypes.func.isRequired,
  events: PropTypes.array,
  filter: PropTypes.object,
  pages: PropTypes.array,
};

ItemContext.defaultProps = {
  align: 'center',
  events: undefined,
  filter: undefined,
  pages: undefined,
};

const select = state => ({
  events: (state.events || {}).items,
  pages: (state.pages || {}).items,
});

export default connect(select)(ItemContext);
