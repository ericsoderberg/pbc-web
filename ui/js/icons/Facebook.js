"use strict";
import React from 'react';
import Icon from './Icon';
export default class Facebook extends Icon {};
Facebook.defaultProps = { ...Icon.defaultProps,
  children: <path d="M14,23 L14,13 L17,13 L18,9 L14,9 L14,7 C14,5.5 15,5 16,5 L18,5 L18,1 C17.5,1 16.5,1 15,1 C12,1 10,3 10,6 L10,9 L7,9 L7,13 L10,13 L10,23 L14,23 Z"/>
};
