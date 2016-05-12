"use strict";
import React, { PropTypes } from 'react';
import markdownToJSX from 'markdown-to-jsx';

const Text = (props) => {
  const { color, text } = props;
  let classNames = ['section__container'];
  let style;
  if (color) {
    style = { backgroundColor: color, color: '#fff' };
    classNames.push('section__container--full');
  }
  return (
    <div className={classNames.join(' ')} style={style}>
      <div className="text section">
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
