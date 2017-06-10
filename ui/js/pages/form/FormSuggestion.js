import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';

const FormSuggestion = props => (
  <div className="box--between">
    <span>{(props.item.formTemplateId || {}).name} {props.item.name}</span>
    <span className="secondary">
      {moment(props.item.modified).format('MMM Do YYYY')}
    </span>
  </div>
);

FormSuggestion.propTypes = {
  item: PropTypes.shape({
    formTemplateId: PropTypes.shape({
      name: PropTypes.string,
    }),
    modified: PropTypes.string,
    name: PropTypes.string,
  }).isRequired,
};

export default FormSuggestion;
