"use strict";
import React from 'react';
import Section from './Section';

const Loading = (props) => {
  const dots = [];
  for (let i=0; i<=3; i++) {
    dots.push(
      <svg key={i} viewBox="0 0 24 24" width="24" height="24">
        <circle stroke="none" cx="12" cy="12" r="12" />
      </svg>
    );
  }
  return (
    <Section full={true}>
      <div className="loading">
        {dots}
      </div>
    </Section>
  );
};

export default Loading;
