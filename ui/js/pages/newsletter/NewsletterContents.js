
import React, { Component, PropTypes } from 'react';
import { postNewsletterRender } from '../../actions';

export default class NewsletterContents extends Component {

  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {
    this._load(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.once && this.props.item) {
      this._load(nextProps);
    }
  }

  componentWillUnmount() {
    this._unmounted = true;
  }

  _load(props) {
    if (props.item.name || props.item.text) {
      postNewsletterRender(props.item)
      .then((rendered) => {
        if (!this._unmounted) {
          this.setState({ rendered });
        }
      })
      .catch(error => console.error('!!! NewsletterContents catch', error));
    }
  }

  render() {
    return (
      <div dangerouslySetInnerHTML={{ __html: this.state.rendered }} />
    );
  }
}

NewsletterContents.propTypes = {
  item: PropTypes.object.isRequired,
  once: PropTypes.boolean,
};

NewsletterContents.defaultProps = {
  once: false,
};
