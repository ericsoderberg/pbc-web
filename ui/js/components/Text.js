
import React, { PropTypes } from 'react';
import Markdown from 'markdown-to-jsx';

const Text = (props) => {
  const { className, text } = props;
  const classes = ['text'];
  if (className) {
    classes.push(className);
  }
  const content = text || props.children || '';
  // strip out inline HTML
  const stripped = content.replace(/(<([^>]+)>)/ig, '');
  return (
    <div className={classes.join(' ')}>
      <Markdown>
        {stripped}
      </Markdown>
    </div>
  );
};

Text.propTypes = {
  children: PropTypes.any,
  className: PropTypes.string,
  text: PropTypes.string,
};

Text.defaultProps = {
  children: undefined,
  className: undefined,
  text: undefined,
};

export default Text;
