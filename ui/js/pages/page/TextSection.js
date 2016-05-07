"use strict";
import React, { PropTypes } from 'react';
import markdownToJSX from 'markdown-to-jsx';

const TextSection = (props) => {
  const { section } = props;
  let classNames = ['page-text__container'];
  let style;
  if (section.color) {
    style = { backgroundColor: section.color, color: '#fff' };
  }
  return (
    <div className={classNames.join(' ')} style={style}>
      <div className="page-text">
        {markdownToJSX(section.text || '')}
      </div>
    </div>
  );
};

TextSection.defaultProps = {
  section: PropTypes.object.isRequired
};

export default TextSection;
