import React, { Component } from 'react';
import PropTypes from 'prop-types';
import PageHeader from '../../components/PageHeader';
import Section from '../../components/Section';
import { postFormTemplateEmailRender } from '../../actions';

export default class FormTemplateEmailPreview extends Component {

  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {
    this._load(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.item) {
      this._load(nextProps);
    }
  }

  componentWillUnmount() {
    this._unmounted = true;
  }

  _load(props) {
    postFormTemplateEmailRender(props.item)
      .then((rendered) => {
        if (!this._unmounted) {
          this.setState({ rendered });
        }
      })
      .catch(error => console.error('!!! FormTemplateEmail Preview catch', error));
  }

  render() {
    const { rendered } = this.state;
    return (
      <main className="email-preview">
        <PageHeader title="Preview" />
        <div dangerouslySetInnerHTML={{ __html: rendered }} />
      </main>
    );
  }
}

FormTemplateEmailPreview.propTypes = {
  item: PropTypes.object.isRequired,
};
