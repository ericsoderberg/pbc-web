"use strict";
import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import moment from 'moment';

const FormItem = (props) => {
  const { className, item: form, onClick } = props;
  let classNames = ['item__container', className];

  const contents = (
    <div className="item">
      <span className="box--row">
        <span>{form.formTemplateId ? form.formTemplateId.name : ''}</span>
        <span>{form.userId ? form.userId.name : ''}</span>
      </span>
      <span>{moment(form.modified).format('MMM Do YYYY')}</span>
    </div>
  );

  let result;
  if (onClick) {
    classNames.push('button--link');
    result = (
      <button className={classNames.join(' ')} type="button" onClick={onClick}>
        {contents}
      </button>
    );
  } else {
    result = (
      <Link className={classNames.join(' ')}
        to={`/forms/${form._id}/edit`}>
        {contents}
      </Link>
    );
  }

  return result;
};

FormItem.propTypes = {
  item: PropTypes.object,
  onClick: PropTypes.func
};

export default FormItem;
