import React, { PropTypes } from 'react';

const Logo = (props) => {
  const { className } = props;
  const classNames = ['logo'];
  if (className) {
    classNames.push(className);
  }
  return (
    <svg version="1.1" viewBox="0 0 240 240" width="240px" height="240px"
      role="img" className={classNames.join(' ')}>
      <circle className="logo__background" fill="#6E615D" cx="120" cy="120" r="120" />
      <g id="Bible" transform="translate(68.000000, 169.000000)" fill="#F99D27">
        <path d="M62,10.2 C62,10.2 34.5,-9.3 0.5,6 L0.5,14.8 C0.6,14.8 18.4,4.5 62,10.2 Z"
          className="logo__left" />
        <path d="M61.9,10.2 C61.9,10.2 89.4,-9.3 123.4,6 L123.4,14.8 C123.3,14.8 105.5,4.5 61.9,10.2 Z"
          className="logo__right" />
      </g>
      <text fontFamily="WorkSans-Light, Work Sans" fontSize="140" fontWeight="300" fill="#FFFFFF">
        <tspan className="logo__p" x="14.02" y="158">p</tspan>
      </text>
      <text fontFamily="WorkSans-Light, Work Sans" fontSize="140" fontWeight="300" fill="#FFFFFF">
        <tspan className="logo__b" x="82.52" y="158">b</tspan>
      </text>
      <text fontFamily="WorkSans-Light, Work Sans" fontSize="140" fontWeight="300" fill="#FFFFFF">
        <tspan className="logo__c" x="155" y="158">c</tspan>
      </text>
    </svg>
  );
};

Logo.propTypes = {
  className: PropTypes.string,
};

Logo.defaultProps = {
  className: undefined,
};

export default Logo;
