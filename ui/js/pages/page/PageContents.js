"use strict";
import React, { PropTypes } from 'react';
import Text from '../../components/Text';
import Image from '../../components/Image';
import EventSummary from '../../components/EventSummary';
import Library from '../../components/Library';
import PageSummaries from '../../components/PageSummaries';
import UserSummary from '../../components/UserSummary';

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
          id={section.objectId} />
      );
    } else if ('library' === section.type) {
      return (
        <Library key={index} full={section.full} color={section.color}
          name={section.name} />
      );
    } else if ('user' === section.type) {
      return (
        <UserSummary key={index} full={section.full} color={section.color}
          id={section.objectId} />
      );
    } else if ('pages' === section.type) {
      return (
        <PageSummaries key={index} full={section.full} color={section.color}
          pageSummaries={section.pages} />
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
