import Icon from './Icon';

export default class Right extends Icon {}

Right.defaultProps = { ...Icon.defaultProps,
  pathCommands: 'M7,23 L18,12 L7,1',
};
