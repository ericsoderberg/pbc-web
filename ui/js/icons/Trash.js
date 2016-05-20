"use strict";
import Icon from './Icon';
export default class Trash extends Icon {};
Trash.defaultProps = { ...Icon.defaultProps,
  pathCommands: "M20,23 L4,23 L4,5 L20,5 L20,23 L20,23 Z M1,5 L23,5 L1,5 Z M15,1 L9,1 L9,5 L15,5 L15,1 L15,1 Z M9,18 L9,10 L9,18 Z M15,18 L15,10 L15,18 Z"
};
