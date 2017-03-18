import Icon from './Icon';

export default class DownArrow extends Icon {}

DownArrow.defaultProps = { ...Icon.defaultProps,
  pathCommands: 'M19,14 L12,21 L12,3',
};
