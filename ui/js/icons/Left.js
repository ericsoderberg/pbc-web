import Icon from './Icon';

export default class Left extends Icon {}

Left.defaultProps = { ...Icon.defaultProps,
  pathCommands: 'M18,23 L7,12 L18,1',
};
