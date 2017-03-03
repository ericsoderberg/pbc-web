"use strict";
import React, { Component, PropTypes } from 'react';
import Section from './Section';
import Text from './Text';
import Image from './Image';
import CalendarSection from '../pages/calendar/CalendarSection';
import EventSection from '../pages/event/EventSection';
import LibrarySection from '../pages/library/LibrarySection';
import PagesSection from '../pages/page/PagesSection';
import PeopleSection from '../pages/user/PeopleSection';
import Video from './Video';
import FormSection from '../pages/form/FormSection';
import FilesSection from '../pages/file/FilesSection';
import Map from './Map';

export default class PageContents extends Component {
  render () {
    const { align, sections } = this.props;
    const elements = sections.map((section, index) => {

      let contents;
      if ('text' === section.type) {
        contents = <Text text={section.text} />;
      } else if ('image' === section.type) {
        contents =  <Image image={section.image} />;
      } else if ('calendar' === section.type) {
        // exclude events already in sections
        const excludeEventIds =
          sections.filter(s => 'event' === s.type)
          .map(s => s.eventId._id || s.eventId);
        contents = (
          <CalendarSection key={index} id={section.calendarId}
            excludeEventIds={excludeEventIds}/>
        );
      } else if ('event' === section.type) {
        contents = (
          <EventSection id={section.eventId} includeMap={section.includeMap}
            navigable={section.navigable} />
        );
      } else if ('library' === section.type) {
        contents =
          <LibrarySection id={section.libraryId} message={section.message} />;
      } else if ('people' === section.type) {
        contents = <PeopleSection people={section.people} />;
      } else if ('pages' === section.type) {
        contents = <PagesSection pages={section.pages} />;
      } else if ('video' === section.type) {
        contents = <Video url={section.url} />;
      } else if ('form' === section.type) {
        contents = <FormSection formTemplateId={section.formTemplateId} />;
      } else if ('files' === section.type) {
        contents = <FilesSection files={section.files} />;
      } else if ('map' === section.type) {
        contents = (
          <Map className='section' address={section.address} plain={true} />
        );
      } else {
        contents = <span>TBD</span>;
      }

      if ('calendar' !== section.type) {
        contents = (
          <Section key={index} align={align}
            full={section.full} color={section.color}
            backgroundImage={section.backgroundImage} plain={section.plain}>
            {contents}
          </Section>
        );
      }

      return contents;
    });
    return <div>{elements}</div>;
  }
}

PageContents.PropTypes = {
  align: PropTypes.oneOf(['start', 'center', 'end']),
  sections: PropTypes.arrayOf(PropTypes.object)
};

PageContents.defaultProps = {
  align: 'center',
  sections: []
};
