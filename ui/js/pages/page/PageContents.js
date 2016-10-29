"use strict";
import React, { PropTypes } from 'react';
import Text from '../../components/Text';
import Image from '../../components/Image';
import EventSummary from '../event/EventSummary';
import LibrarySummary from '../library/LibrarySummary';
import PageSummaries from './PageSummaries';
import PeopleSummary from './PeopleSummary';
import Video from '../../components/Video';
import FormSummary from '../form/FormSummary';

const PageContents = (props) => {
  const page = props.item;
  const sections = (page.sections || []).map((section, index) => {
    if ('text' === section.type) {
      return <Text key={index} color={section.color} text={section.text} />;
    } else if ('image' === section.type) {
      return <Image key={index} full={section.full} image={section.image} />;
    } else if ('event' === section.type) {
      return (
        <EventSummary key={index} full={section.full} color={section.color}
          id={section.eventId} navigable={section.navigable} />
      );
    } else if ('library' === section.type) {
      return (
        <LibrarySummary key={index} full={section.full} color={section.color}
          id={section.libraryId} message={section.message} />
      );
    } else if ('people' === section.type) {
      return (
        <PeopleSummary key={index} full={section.full} color={section.color}
          people={section.people} />
      );
    } else if ('pages' === section.type) {
      return (
        <PageSummaries key={index} full={section.full} color={section.color}
          pages={section.pages} />
      );
    } else if ('video' === section.type) {
      return (
        <Video key={index} full={section.full} color={section.color}
          url={section.url} />
      );
    } else if ('form' === section.type) {
      return (
        <FormSummary key={index} full={section.full} color={section.color}
          formTemplateId={section.formTemplateId} />
      );
    } else {
      return 'TBD';
    }
  });
  return <div>{sections}</div>;
};

PageContents.PropTypes = {
  item: PropTypes.object.isRequired
};

export default PageContents;
