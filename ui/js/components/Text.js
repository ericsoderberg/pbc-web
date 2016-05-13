"use strict";
import React, { PropTypes } from 'react';
import markdownToJSX from 'markdown-to-jsx';
import Section from './Section';

const Text = (props) => {
  const { text, color, plain } = props;
  const full = color ? true : props.full;
  return (
    <Section color={color} full={full} plain={plain}>
      <div className="text">
        {markdownToJSX(text || '')}
      </div>
    </Section>
  );
};

Text.propTypes = {
  text: PropTypes.string,
  ...Section.propTypes
};

export default Text;
