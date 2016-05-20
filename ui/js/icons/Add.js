"use strict";
import Icon from './Icon';
export default class Add extends Icon {};
Add.defaultProps = { ...Icon.defaultProps,
  pathCommands: "M0,12 L24,12 M12,24 L12,0"
};
