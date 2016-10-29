"use strict";
import React, { Component, PropTypes } from 'react';
import Section from './Section';

export default class Image extends Component {
  render () {
    const { avatar, image, full, plain, style } = this.props;
    let classNames = ['image'];
    if (avatar) {
      classNames.push('image--avatar');
    }
    if (this.props.className) {
      classNames.push(this.props.className);
    }

    return (
      <Section full={full} plain={plain}>
        <img className={classNames.join(' ')} src={image ? image.data : ''}
          style={style} />
      </Section>
    );
  }
};

Image.propTypes = {
  avatar: PropTypes.bool,
  image: PropTypes.shape({
    data: PropTypes.string.isRequired
  }),
  ...Section.propTypes
};
