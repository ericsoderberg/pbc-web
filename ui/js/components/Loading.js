import React from 'react';
import PropTypes from 'prop-types';
import Section from './Section';

const Loading = (props) => {
  const { small } = props;
  const dots = [];
  for (let i = 0; i <= 3; i += 1) {
    dots.push(
      <svg key={i} viewBox="0 0 24 24" width="24" height="24">
        <circle stroke="none" cx="12" cy="12" r="12" />
      </svg>,
    );
  }
  let contents = <div className="loading">{dots}</div>;
  if (!small) {
    contents = <Section full={true}>{contents}</Section>;
  }
  return contents;
};

Loading.propTypes = {
  small: PropTypes.bool,
};

export default Loading;
