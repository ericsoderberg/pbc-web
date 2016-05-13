"use strict";
import React, { Component, PropTypes } from 'react';
import Section from './Section';

const VIMEO_REGEXP = /vimeo\.com\/(\d+)/;

export default class Video extends Component {

  render () {
    const { url, full, plain } = this.props;

    let iframe;
    if (url) {
      // TOOD: Handle YouTube vs. Vimeo
      const match = url.match(VIMEO_REGEXP);
      if (match) {
        iframe = (
          <iframe className="video vimeo-player section" type="text/html" width="960" height="540"
            src={`https://player.vimeo.com/video/${match[1]}?title=0&byline=0&portrait=0`}
            frameBorder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen>
          </iframe>
        );
      }
    }

    return (
      <Section full={full} plain={plain}>
        {iframe}
      </Section>
    );
  }
};

Video.propTypes = {
  url: PropTypes.string,
  ...Section.propTypes
};
