"use strict";
import React, { PropTypes } from 'react';
import markdownToJSX from 'markdown-to-jsx';
import Section from './Section';

const Text = (props) => {
  const { text, color, plain, full } = props;
  const content = text || props.children;
  return (
    <Section color={color} full={full} plain={plain}>
      <div className="text">
        {markdownToJSX(content || '')}
      </div>
    </Section>
  );
};

Text.propTypes = {
  text: PropTypes.string,
  ...Section.propTypes
};

export default Text;
