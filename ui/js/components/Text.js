
import React from 'react';
import PropTypes from 'prop-types';
import Markdown from 'markdown-to-jsx';

const Text = (props) => {
  const { backgroundColor, className, text } = props;
  const classes = ['text'];
  if (className) {
    classes.push(className);
  }
  const textContent = text || props.children || '';
  // strip out inline HTML
  let contents = <Markdown>{textContent.replace(/(<([^>]+)>)/ig, '')}</Markdown>;
  if (backgroundColor) {
    contents = (
      <div className="text-contents" style={{ backgroundColor }}>
        {contents}
      </div>
    );
  }
  return (
    <div className={classes.join(' ')}>
      {contents}
    </div>
  );
};

Text.propTypes = {
  backgroundColor: PropTypes.string,
  children: PropTypes.any,
  className: PropTypes.string,
  text: PropTypes.string,
};

Text.defaultProps = {
  backgroundColor: undefined,
  children: undefined,
  className: undefined,
  text: undefined,
};

export default Text;
