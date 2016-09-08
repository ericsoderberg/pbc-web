"use strict";
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import moment from 'moment';
import List from '../../components/List';

const Item = (props) => {
  const { className, item: form } = props;
  let classNames = ['item__container', className];
  return (
    <Link className={classNames.join(' ')}
      to={`/forms/${form._id}/edit`}>
      <div className="item">
        <span className="box--row">
          <span>{form.formTemplateId.name}</span>
          <span>{(form.userId || {}).name}</span>
        </span>
        <span>{moment(form.modified).format('MMM Do YYYY')}</span>
      </div>
    </Link>
  );
};

export default class Forms extends Component {

  render () {
    const { location } = this.props;
    const populate = [
      { path: 'formTemplateId', select: 'name' },
      { path: 'userId', select: 'name' }
    ];

    return (
      <List location={location}
        category="forms" title="Forms" path="/forms" search={false}
        filters={[{
          property: 'formTemplateId', category: 'form-templates',
          allLabel: 'All templates'
        }, {
          property: 'userId', category: 'users', allLabel: 'Anyone'
        }]} sort="-modified"
        populate={populate}
        addIfFilter="formTemplateId"
        Item={Item} />
    );
  }
};

Forms.propTypes = {
  location: PropTypes.object
};
