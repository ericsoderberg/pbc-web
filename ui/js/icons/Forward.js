import Icon from './Icon';

export default class Forward extends Icon {}

Forward.defaultProps = { ...Icon.defaultProps,
  pathCommands: 'M7,1 L18,11 L7,23',
};
