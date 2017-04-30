
import React, { PropTypes } from 'react';
import Add from '../../components/Add';
import { searchToObject } from '../../utils/Params';
import MessageFormContents from './MessageFormContents';
import MessagePreview from './MessagePreview';

const MessageAdd = (props) => {
  const { history, location } = props;
  const query = searchToObject(location.search);
  return (
    <Add category="messages" FormContents={MessageFormContents}
      Preview={MessagePreview} showable={true} title="Add Message"
      default={{
        libraryId: query.libraryId,
        date: (new Date()).toISOString(),
      }}
      history={history} />
  );
};

MessageAdd.propTypes = {
  history: PropTypes.any.isRequired,
  location: PropTypes.object.isRequired,
};

export default MessageAdd;
