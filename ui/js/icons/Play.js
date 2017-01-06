"use strict";
import Icon from './Icon';
export default class Play extends Icon {};
Play.defaultProps = { ...Icon.defaultProps,
  pathCommands: "M3,22 L21,12 L3,2 L3,22 Z"
};
