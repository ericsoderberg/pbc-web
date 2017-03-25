import Icon from './Icon';

export default class Download extends Icon {}

Download.defaultProps = { ...Icon.defaultProps,
  pathCommands: 'M1,17 L1,23 L23,23 L23,17 M12,2 L12,19 M5,12 L12,19 L19,12',
};
