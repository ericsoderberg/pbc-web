"use strict";
import React, { PropTypes } from 'react';
import markdownToJSX from 'markdown-to-jsx';

const Text = (props) => {
  const { className, text } = props;
  let classes = ['text'];
  if (className) {
    classes.push(className);
  }
  const content = text || props.children || '';
  // strip out inline HTML
  const stripped = content.replace(/(<([^>]+)>)/ig,"");
  return (
    <div className={classes.join(' ')}>
      {markdownToJSX(stripped)}
    </div>
  );
};

Text.propTypes = {
  text: PropTypes.string
};

export default Text;
