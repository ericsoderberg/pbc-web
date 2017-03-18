import Icon from './Icon';

export default class Blank extends Icon {}

Blank.defaultProps = { ...Icon.defaultProps,
  pathCommands: '',
};
