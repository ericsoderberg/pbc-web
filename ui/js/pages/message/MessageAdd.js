
import React, { PropTypes } from 'react';
import Add from '../../components/Add';
import MessageFormContents from './MessageFormContents';
import MessagePreview from './MessagePreview';

const MessageAdd = (props) => {
  const { location: { query } } = props;
  return (
    <Add category="messages" FormContents={MessageFormContents}
      Preview={MessagePreview} showable={true} title="Add Message"
      default={{ libraryId: query.libraryId }} />
  );
};

MessageAdd.propTypes = {
  location: PropTypes.shape({
    query: PropTypes.shape({
      libraryId: PropTypes.string,
    }),
  }).isRequired,
};

export default MessageAdd;
