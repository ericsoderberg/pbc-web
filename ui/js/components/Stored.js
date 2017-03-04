
import { Component, createElement } from 'react';
import { getState, dispatch, subscribe } from '../store';

export default function (Wrapped, mapper) {
  return class Stored extends Component {

    constructor(props) {
      super(props);
      this._onChange = this._onChange.bind(this);
      let mappedProps = {};
      if (mapper) {
        mappedProps = mapper(getState(), props);
      }
      this.state = { props: { ...props, ...mappedProps, dispatch } };
    }

    componentDidMount() {
      this._unsubscribe = subscribe(this._onChange);
    }

    componentWillReceiveProps(nextProps) {
      if (mapper) {
        const mappedProps = mapper(getState(), nextProps);
        this.setState({ props: { ...nextProps, ...mappedProps } });
      } else {
        this.setState({ props: nextProps });
      }
    }

    componentWillUnmount() {
      this._unsubscribe();
    }

    _onChange() {
      let mappedProps = {};
      if (mapper) {
        mappedProps = mapper(getState(), this.props);
      }
      this.setState({
        props: {
          ...this.props,
          ...mappedProps,
          dispatch,
        },
      });
    }

    render() {
      return createElement(Wrapped, this.state.props, this.props.children);
    }
  };
}
