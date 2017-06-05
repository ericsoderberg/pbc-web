
import React from 'react';
import PropTypes from 'prop-types';
import PageHeader from '../../components/PageHeader';
import MessageContents from './MessageContents';

const MessagePreview = (props) => {
  const { item: message } = props;

  return (
    <main className="page-preview">
      <PageHeader title="Preview" />
      <MessageContents item={message} />
    </main>
  );
};

MessagePreview.propTypes = {
  item: PropTypes.object.isRequired,
};

export default MessagePreview;
