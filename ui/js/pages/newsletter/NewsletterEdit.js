
import React, { Component, PropTypes } from 'react';
import { postItem } from '../../actions';
import Edit from '../../components/Edit';
import Button from '../../components/Button';
import NewsletterFormContents from './NewsletterFormContents';
import NewsletterPreview from './NewsletterPreview';

export default class NewsletterEdit extends Component {

  constructor() {
    super();
    this._onChange = this._onChange.bind(this);
    this._onCopy = this._onCopy.bind(this);
  }

  _onChange(newsletter) {
    this.setState({ newsletter });
  }

  _onCopy(event) {
    event.preventDefault();
    const { newsletter } = this.state;
    const copyItem = { ...newsletter };
    delete copyItem._id;
    copyItem.name += ' - Copy';
    delete copyItem.address;
    postItem('newsletters', copyItem)
    .then((newItem) => {
      this.context.router.replace(`/newsletters/${newItem._id}/edit`);
    })
    .catch(error => console.error('!!! NewsletterEdit catch', error));
  }

  render() {
    const { params } = this.props;
    const copyControl = (
      <Button label="Copy" secondary={true} onClick={this._onCopy} />
    );
    return (
      <Edit title="Edit Newsletter" category="newsletters" params={params}
        footerActions={copyControl} removeBackLevel={1}
        FormContents={NewsletterFormContents} Preview={NewsletterPreview}
        onChange={this._onChange} />
    );
  }
}

NewsletterEdit.propTypes = {
  params: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
};

NewsletterEdit.contextTypes = {
  router: PropTypes.any,
};
