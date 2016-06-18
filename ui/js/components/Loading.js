"use strict";
import React from 'react';
import Section from './Section';

const Loading = (props) => {
  return (
    <Section full={true}>
      <div className="loading">
        Loading ...
      </div>
    </Section>
  );
};

export default Loading;
