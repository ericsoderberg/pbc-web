import Icon from './Icon';

export default class Pause extends Icon {}

Pause.defaultProps = { ...Icon.defaultProps,
  pathCommands: 'M3,21 L9,21 L9,3 L3,3 L3,21 Z M15,21 L21,21 L21,3 L15,3 L15,21 Z',
};
