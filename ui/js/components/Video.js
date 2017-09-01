import React, { Component } from 'react';
import PropTypes from 'prop-types';

// e.g. https://vimeo.com/205930454
const VIMEO_REGEXP = /vimeo\.com\/(\d+)/;
// e.g. https://vimeo.com/album/4142534
const VIMEO_ALBUM_REGEXP = /vimeo\.com\/album\/(\d+)/;
const YOUTUBE_REGEXP = /youtube\.com\/([\w-]+)|youtu\.be\/([\w-]+)/;

export default class Video extends Component {

  render() {
    const { autoplay, url } = this.props;

    let contents = <span>Unknown type</span>;
    if (url) {
      let match = url.match(VIMEO_ALBUM_REGEXP);
      if (match) {
        const src = `//player.vimeo.com/hubnut/album/` +
          `${match[1]}?title=0&byline=0&portrait=0`;
        contents = (
          <iframe src={src}
            width="960"
            height="540"
            frameBorder="0"
            webkitAllowFullScreen={true}
            mozallowfullscreen={true}
            allowFullScreen={true} />
        );
      }
      match = url.match(VIMEO_REGEXP);
      if (match) {
        let src = `//player.vimeo.com/video/` +
          `${match[1]}?title=0&byline=0&portrait=0`;
        if (autoplay) {
          src += '&autoplay=1';
        }
        contents = (
          <iframe className="video vimeo-player"
            type="text/html"
            width="960"
            height="540"
            src={src}
            frameBorder="0"
            allowFullScreen={true} />
        );
      }
      match = url.match(YOUTUBE_REGEXP);
      if (match) {
        const src = `//www.youtube.com/embed/` +
          `${match[1] || match[2]}`;
        contents = (
          <iframe className="video youtube-player"
            type="text/html"
            src={src}
            frameBorder="0"
            width="960"
            height="540" />
        );
      }
    }

    return contents;
  }
}

Video.propTypes = {
  autoplay: PropTypes.bool,
  url: PropTypes.string,
};

Video.defaultProps = {
  autoplay: true,
  url: undefined,
};
