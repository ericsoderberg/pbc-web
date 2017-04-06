
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import moment from 'moment';
import { loadItem, unloadItem } from '../../actions';
import ItemHeader from '../../components/ItemHeader';
import Loading from '../../components/Loading';
import PageContext from '../page/PageContext';
import EventContents from './EventContents';

const DATE_FORMAT = 'YYYY-MM-DD';

class Event extends Component {

  componentDidMount() {
    const { event } = this.props;
    if (!event) {
      this._load(this.props);
    } else {
      document.title = event.name;
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.id !== this.props.id && !nextProps.event) {
      this._load(nextProps);
    }
    if (nextProps.event) {
      document.title = nextProps.event.name;
    }
  }

  componentWillUnmount() {
    const { dispatch, id } = this.props;
    dispatch(unloadItem('events', id));
  }

  _load(props) {
    const { dispatch, id } = props;
    dispatch(loadItem('events', id, { populate: true }));
  }

  render() {
    const { event } = this.props;

    let actions;
    let contents;
    let context;
    if (event) {
      contents = <EventContents item={event} />;
      const calendar = event.calendarId || {};
      const path = ((calendar.path || calendar._id) ?
        `/calendars/${calendar.path || calendar._id}` : '/calendar') +
        // TODO: pick date via shared function with EventTimes
        `?focus=${encodeURIComponent(moment(event.start).format(DATE_FORMAT))}`;
      actions = [
        <Link key="calendar" to={path}>Calendar</Link>,
      ];

      let filter;
      if (calendar._id) {
        filter = { $or: [
          { 'sections.eventId': event._id },
          { 'sections.calendarId': event.calendarId._id },
        ] };
      } else {
        filter = { 'sections.eventId': event._id };
      }

      context = (
        <PageContext align="center"
          filter={filter} />
      );
    } else {
      contents = <Loading />;
    }

    return (
      <main>
        <ItemHeader category="events" item={event} actions={actions} />
        {contents}
        {context}
      </main>
    );
  }
}

Event.propTypes = {
  dispatch: PropTypes.func.isRequired,
  event: PropTypes.object,
  id: PropTypes.string.isRequired,
  notFound: PropTypes.bool,
};

Event.defaultProps = {
  event: undefined,
  notFound: false,
};

const select = (state, props) => {
  const id = props.match.params.id;
  return {
    event: state[id],
    id,
    notFound: state.notFound[id],
    session: state.session,
  };
};

export default connect(select)(Event);
