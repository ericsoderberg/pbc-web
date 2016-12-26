"use strict";
import Icon from './Icon';
export default class Filter extends Icon {};
Filter.defaultProps = { ...Icon.defaultProps,
  pathCommands: "M1.5,2 L1.5,2.5 L9.5,12.5 L9.5,22.5 L14.5,20.5 L14.5,12.5 L22.5,2.5 L22.5,2 Z"
};
