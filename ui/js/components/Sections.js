import React, { Component } from 'react';
import PropTypes from 'prop-types';
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
import Donate from './Donate';

export default class Sections extends Component {
  render() {
    const { align, sections } = this.props;
    const elements = sections.map((section) => {
      let contents;
      let { color: backgroundColor, backgroundImage } = section;
      if (section.type === 'text') {
        contents = <Text text={section.text} backgroundColor={backgroundColor} />;
      } else if (section.type === 'image') {
        contents = <Image image={section.image} />;
      } else if (section.type === 'calendar') {
        // exclude events already in sections
        const excludeEventIds =
          sections.filter(s => s.type === 'event' && s.eventId)
            .map(s => (s.eventId._id || s.eventId));
        contents = (
          <CalendarSection key={section._id || section.id}
            id={section.calendarId}
            calendar={section.calendar}
            events={section.events}
            excludeEventIds={excludeEventIds}
            omitRecurring={section.omitRecurring} />
        );
      } else if (section.type === 'event') {
        let innerColor;
        if (section.eventId && section.eventId.image && section.eventId.color) {
          innerColor = section.eventId.color;
        }
        contents = (
          <EventSection id={section.eventId}
            includeMap={section.includeMap}
            navigable={section.navigable}
            backgroundColor={innerColor}
            includeBackground={section.backgroundImage === undefined} />
        );
        if (!backgroundImage && section.eventId) {
          backgroundImage = section.eventId.image;
        }
        if (!backgroundColor && section.eventId) {
          backgroundColor = section.eventId.color;
        }
      } else if (section.type === 'library') {
        contents =
          <LibrarySection id={section.libraryId} message={section.message} />;
      } else if (section.type === 'people') {
        contents = <PeopleSection people={section.people} />;
      } else if (section.type === 'pages') {
        contents = (
          <PagesSection pages={section.pages}
            backgroundColor={backgroundImage ? backgroundColor : undefined} />
        );
      } else if (section.type === 'video') {
        contents = <Video url={section.url} autoplay={false} />;
      } else if (section.type === 'form') {
        contents = (
          <FormSection formTemplateId={section.formTemplateId}
            formTemplate={section.formTemplate} />
        );
      } else if (section.type === 'files') {
        contents = <FilesSection files={section.files} />;
      } else if (section.type === 'map') {
        contents = (
          <Map className="section" address={section.address} plain={true} />
        );
      } else if (section.type === 'donate') {
        contents = <Donate className="section" />;
      } else {
        contents = <span>TBD</span>;
      }

      if (section.type !== 'calendar') {
        contents = (
          <Section key={section._id || section.id}
            align={align}
            full={section.full}
            backgroundColor={backgroundColor}
            backgroundImage={backgroundImage}
            plain={section.plain}>
            {contents}
          </Section>
        );
      }

      return contents;
    });
    return <div>{elements}</div>;
  }
}

Sections.propTypes = {
  align: PropTypes.oneOf(['start', 'center', 'end']),
  sections: PropTypes.arrayOf(PropTypes.object),
};

Sections.defaultProps = {
  align: 'center',
  sections: [],
};
