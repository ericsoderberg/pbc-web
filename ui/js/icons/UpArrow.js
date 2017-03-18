import Icon from './Icon';

export default class UpArrow extends Icon {}

UpArrow.defaultProps = { ...Icon.defaultProps,
  pathCommands: 'M12,21 L12,3 L5,11',
};
