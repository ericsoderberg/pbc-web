import Icon from './Icon';

export default class List extends Icon {}

List.defaultProps = { ...Icon.defaultProps,
  pathCommands: 'M0,6 L24,6 M0,12 L24,12 M0,18 L24,18',
};
