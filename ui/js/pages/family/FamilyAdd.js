
import React, { PropTypes } from 'react';
import Add from '../../components/Add';
import FamilyFormContents from './FamilyFormContents';
import Stored from '../../components/Stored';

const FamilyAdd = (props) => {
  const { session } = props;
  const family = {
    adults: [{ email: session.email, name: session.name }],
    children: [],
  };
  return (
    <Add category="families" default={family} createSession={true}
      FormContents={FamilyFormContents} title="Add Family" />
  );
};

FamilyAdd.propTypes = {
  session: PropTypes.object.isRequired,
};

const select = state => ({
  session: state.session,
});

export default Stored(FamilyAdd, select);
