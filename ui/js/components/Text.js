"use strict";
import React, { PropTypes } from 'react';
import markdownToJSX from 'markdown-to-jsx';

const Text = (props) => {
  const { color, text } = props;
  let classNames = ['page-text__container'];
  let style;
  if (color) {
    style = { backgroundColor: color, color: '#fff' };
  }
  return (
    <div className={classNames.join(' ')} style={style}>
      <div className="page-text">
        {markdownToJSX(text || '')}
      </div>
    </div>
  );
};

Text.propTypes = {
  color: PropTypes.string,
  text: PropTypes.string
};

export default Text;
