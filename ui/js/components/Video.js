"use strict";
import React, { Component, PropTypes } from 'react';

const VIMEO_REGEXP = /vimeo\.com\/(\d+)/;
const YOUTUBE_REGEXP = /youtube\.com\/(\w+)|youtu\.be\/(\w+)/;

export default class Video extends Component {

  render () {
    const { url } = this.props;

    let contents = <span>Unknown type</span>;
    if (url) {
      // TOOD: Handle YouTube vs. Vimeo
      let match = url.match(VIMEO_REGEXP);
      if (match) {
        const src = `${window.location.protocol}//player.vimeo.com/video/` +
          `${match[1]}?title=0&byline=0&portrait=0`;
        contents = (
          <iframe className="video vimeo-player" type="text/html"
            width="960" height="540"
            src={src}
            frameBorder="0" allowFullScreen />
        );
      }
      match = url.match(YOUTUBE_REGEXP);
      if (match) {
        const src = `${window.location.protocol}//www.youtube.com/embed/` +
          `${match[1]}`;
        contents = (
          <iframe className="video youtube-player" type="text/html" src={src}
            frameBorder="0" width="960" height="540" />
        );
      }
    }

    return contents;
  }
};

Video.propTypes = {
  url: PropTypes.string
};
