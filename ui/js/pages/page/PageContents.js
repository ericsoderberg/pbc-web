"use strict";
import React, { Component, PropTypes } from 'react';
import Section from '../../components/Section';
import Text from '../../components/Text';
import Image from '../../components/Image';
import CalendarSummary from '../calendar/CalendarSummary';
import EventSummary from '../event/EventSummary';
import LibrarySummary from '../library/LibrarySummary';
import PageSummaries from './PageSummaries';
import PeopleSummary from './PeopleSummary';
import Video from '../../components/Video';
import FormSummary from '../form/FormSummary';
import FilesSummary from './FilesSummary';

export default class PageContents extends Component {
  render () {
    const { item: page } = this.props;
    const sections = (page.sections || []).map((section, index) => {

      let contents;
      if ('text' === section.type) {
        contents = <Text text={section.text} />;
      } else if ('image' === section.type) {
        contents =  <Image image={section.image} />;
      } else if ('calendar' === section.type) {
        contents = <CalendarSummary id={section.calendarId} />;
      } else if ('event' === section.type) {
        contents = (
          <EventSummary id={section.eventId} includeMap={section.includeMap}
            navigable={section.navigable} />
        );
      } else if ('library' === section.type) {
        contents =
          <LibrarySummary id={section.libraryId} message={section.message} />;
      } else if ('people' === section.type) {
        contents = <PeopleSummary people={section.people} />;
      } else if ('pages' === section.type) {
        contents = <PageSummaries pages={section.pages} />;
      } else if ('video' === section.type) {
        contents = <Video url={section.url} />;
      } else if ('form' === section.type) {
        contents = <FormSummary formTemplateId={section.formTemplateId} />;
      } else if ('files' === section.type) {
        contents = <FilesSummary files={section.files} />;
      } else {
        contents = <span>TBD</span>;
      }

      if ('calendar' !== section.type) {
        contents = (
          <Section key={index} align='center' full={section.full}
            color={section.color}
            backgroundImage={section.backgroundImage} plain={section.plain}>
            {contents}
          </Section>
        );
      }

      return contents;
    });
    return <div>{sections}</div>;
  }
}

PageContents.PropTypes = {
  item: PropTypes.object.isRequired
};
