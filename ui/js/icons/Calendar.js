"use strict";
import Icon from './Icon';
export default class Search extends Icon {};
Search.defaultProps = { ...Icon.defaultProps,
  pathCommands: "M2,5 L22,5 L22,22 L2,22 L2,5 Z M18,5 L18,1 L18,5 Z M6,5 L6,1 M2,10 L22,10"
};
