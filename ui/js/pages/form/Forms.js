"use strict";
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import moment from 'moment';
import { getItems } from '../../actions';
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
          <span>{form.userId.name}</span>
        </span>
        <span>{moment(form.modified).format('MMM Do YYYY')}</span>
      </div>
    </Link>
  );
};

export default class Forms extends Component {

  constructor () {
    super();
    this.state = { filterOptions: [] };
  }

  componentDidMount () {
    getItems('form-templates', { select: 'name' })
    .then(response => this.setState({ filterOptions:
      // convert to options format with label and value properties
      response.map(formTemplate => ({
        label: formTemplate.name,
        value: formTemplate._id
      }))}))
    .catch(error => console.log('!!! Messages catch', error));
  }

  render () {
    const { location } = this.props;
    const { filterOptions } = this.state;

    const filter = { property: "formTemplateId", options: filterOptions };
    const populate = [
      { path: 'formTemplateId', select: 'name' },
      { path: 'userId', select: 'name' }
    ];

    return (
      <List location={location}
        category="forms" title="Forms" path="/forms"
        filter={filter} sort="-modified" populate={populate}
        Item={Item} />
    );
  }
};

Forms.propTypes = {
  location: PropTypes.object
};

// export default class Forms extends List {};
//
// Forms.defaultProps = {
//   ...List.defaultProps,
//   category: 'forms',
//   Item: Item,
//   path: '/forms',
//   populate: [
//     { path: 'formTemplateId', select: 'name' },
//     { path: 'userId', select: 'name' }
//   ],
//   title: 'Forms'
// };
