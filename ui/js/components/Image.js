"use strict";
import React, { Component, PropTypes } from 'react';
import Section from './Section';

export default class Image extends Component {
  render () {
    const { image, full, plain, style } = this.props;
    let classNames = ['image'];
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
  image: PropTypes.shape({
    data: PropTypes.string.isRequired
  }),
  ...Section.propTypes
};
