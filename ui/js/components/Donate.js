// (C) Copyright 2017 Hewlett Packard Enterprise Development LP

import React from 'react';
import PropTypes from 'prop-types';

const Donate = (props) => {
  const { className } = props;
  const classNames = ['donate'];
  if (className) {
    classNames.push(className);
  }
  return (
    <div className={classNames.join(' ')}>
      <form action="https://www.paypal.com/cgi-bin/webscr" method="post">
        <input name="cmd" value="_s-xclick" type="hidden" />
        <input name="hosted_button_id" value="S3K77NGEYHRS2" type="hidden" />
        <input src="https://www.paypalobjects.com/webstatic/en_US/i/btn/png/gold-pill-paypal-60px.png"
          name="submit"
          alt="PayPal - The safer, easier way to pay online!"
          border="0"
          type="image" />
        <img alt=""
          src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif"
          border="0"
          height="1"
          width="1" />
      </form>
    </div>
  );
};

Donate.propTypes = {
  className: PropTypes.string,
};

Donate.defaultProps = {
  className: undefined,
};

export default Donate;
