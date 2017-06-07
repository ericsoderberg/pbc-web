
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import moment from 'moment-timezone';
import List from '../../components/List';

const Item = (props) => {
  const { className, item: form } = props;
  const classNames = ['item__container', className];
  return (
    <Link className={classNames.join(' ')}
      to={`/forms/${form._id}/edit`}>
      <div className="item">
        <span className="box--row">
          <span>{form.formTemplateId.name}</span>
          <span>{form.name || (form.userId || {}).name}</span>
        </span>
        <span className="secondary">
          {moment(form.modified).format('MMM Do YYYY')}
        </span>
      </div>
    </Link>
  );
};

Item.propTypes = {
  className: PropTypes.string,
  item: PropTypes.object.isRequired,
};

Item.defaultProps = {
  className: undefined,
};

const Forms = (props) => {
  const { history, location } = props;
  const populate = [
    { path: 'formTemplateId', select: 'name' },
    { path: 'userId', select: 'name' },
  ];

  return (
    <List history={history} location={location}
      category="forms" title="Forms" path="/forms"
      filters={[{
        property: 'formTemplateId',
        category: 'form-templates',
        allLabel: 'All templates',
      }, {
        property: 'userId', category: 'users', allLabel: 'Anyone',
      }]} sort="-modified"
      populate={populate}
      addIfFilter="formTemplateId"
      Item={Item} />
  );
};

Forms.propTypes = {
  history: PropTypes.any.isRequired,
  location: PropTypes.object.isRequired,
};

export default Forms;
