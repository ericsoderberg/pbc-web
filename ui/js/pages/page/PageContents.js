"use strict";
import React, { PropTypes } from 'react';
import Text from '../../components/Text';
import Image from '../../components/Image';
import EventSummary from '../event/EventSummary';
import Library from '../message/Library';
import PageSummaries from './PageSummaries';
import UserSummary from '../user/UserSummary';
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
          id={section.eventId} />
      );
    } else if ('library' === section.type) {
      return (
        <Library key={index} full={section.full} color={section.color}
          name={section.name} />
      );
    } else if ('user' === section.type) {
      return (
        <UserSummary key={index} full={section.full} color={section.color}
          id={section.userId} />
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
