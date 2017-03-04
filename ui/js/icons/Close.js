import Icon from './Icon';

export default class Close extends Icon {}

Close.defaultProps = { ...Icon.defaultProps,
  pathCommands: 'M3,3 L21,21 M3,21 L21,3',
};
