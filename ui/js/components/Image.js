"use strict";
import React, { PropTypes } from 'react';
import Section from './Section';

const Image = (props) => {
  const { image, full, plain } = props;
  let classNames = ['image'];
  if (props.className) {
    classNames.push(props.className);
  }

  return (
    <Section full={full} plain={plain}>
      <img className={classNames.join(' ')} src={image ? image.data : ''} />
    </Section>
  );
};

Image.propTypes = {
  image: PropTypes.shape({
    data: PropTypes.string.isRequired
  }),
  ...Section.propTypes
};

export default Image;
