import React, { PropTypes } from 'react';
import PageHeader from '../../components/PageHeader';
import EventContents from './EventContents';

const EventPreview = (props) => {
  const { item } = props;
  const event = item;

  return (
    <main className="page-preview">
      <PageHeader title="Preview" />
      <EventContents item={event} />
    </main>
  );
};

EventPreview.propTypes = {
  item: PropTypes.object.isRequired,
};

export default EventPreview;
