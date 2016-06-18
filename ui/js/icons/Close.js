"use strict";
import Icon from './Icon';
export default class Close extends Icon {};
Close.defaultProps = { ...Icon.defaultProps,
  pathCommands: "M0,1 L24,24 M0,24 L24,0"
};
