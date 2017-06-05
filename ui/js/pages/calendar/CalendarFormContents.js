
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { loadCategory, unloadCategory } from '../../actions';
import FormField from '../../components/FormField';

class CalendarFormContents extends Component {

  componentDidMount() {
    const { dispatch, formState, session } = this.props;
    if (session.userId.administrator) {
      dispatch(loadCategory('domains', { sort: 'name' }));
    } else if (session.userId.administratorDomainId) {
      formState.change('domainId')(session.userId.administratorDomainId);
    }
  }

  componentWillUnmount() {
    const { dispatch, session } = this.props;
    if (session.userId.administrator) {
      dispatch(unloadCategory('domains'));
    }
  }

  render() {
    const { className, domains, errors, formState, session } = this.props;
    const calendar = formState.object;

    let administeredBy;
    if (session.userId.administrator) {
      const options = domains.map(domain => (
        <option key={domain._id} label={domain.name} value={domain._id} />
      ));
      options.unshift(<option key={0} />);
      administeredBy = (
        <FormField label="Administered by" error={errors.domainId}>
          <select name="domainId"
            value={calendar.domainId || ''}
            onChange={formState.change('domainId')}>
            {options}
          </select>
        </FormField>
      );
    }

    return (
      <div className={className}>
        <fieldset className="form__fields">
          <FormField label="Name" error={errors.name}>
            <input name="name"
              value={calendar.name || ''}
              onChange={formState.change('name')} />
          </FormField>
          <FormField name="path"
            label="Url ID"
            help="unique url name"
            error={errors.path}>
            <input name="path"
              value={calendar.path || ''}
              onChange={formState.change('path')} />
          </FormField>
          <FormField>
            <input name="public"
              type="checkbox"
              checked={calendar.public || false}
              onChange={formState.toggle('public')} />
            <label htmlFor="public">public</label>
          </FormField>
          {administeredBy}
        </fieldset>
      </div>
    );
  }
}

CalendarFormContents.propTypes = {
  className: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
  domains: PropTypes.array,
  errors: PropTypes.object,
  formState: PropTypes.object.isRequired,
  session: PropTypes.object.isRequired,
};

CalendarFormContents.defaultProps = {
  className: undefined,
  domains: [],
  errors: {},
};

const select = state => ({
  domains: (state.domains || {}).items,
});

export default connect(select)(CalendarFormContents);
