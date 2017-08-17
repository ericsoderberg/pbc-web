import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { loadCategory, unloadCategory } from '../actions';

import FormField from './FormField';

class DomainIdField extends Component {

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(loadCategory('domains', { sort: 'name' }));
  }

  componentWillReceiveProps(nextProps) {
    const { formState, session } = nextProps;
    if (!session.userId.administrator && !formState.object.domainId) {
      formState.change('domainId')(session.userId.domainIds[0]);
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch(unloadCategory('domains'));
  }

  render() {
    const { domains, formState, session } = this.props;
    const options = domains
      .filter(domain => (session.userId.administrator ||
        session.userId.domainIds.some(id => id === domain._id)))
      .map(domain => (
        <option key={domain._id} label={domain.name} value={domain._id} />
      ));
    if (session.userId.administrator) {
      options.unshift(<option key={0} />);
    }
    return (
      <FormField label="Administered by">
        <select name="domainId"
          value={formState.object.domainId || ''}
          onChange={formState.change('domainId')}>
          {options}
        </select>
      </FormField>
    );
  }
}

DomainIdField.propTypes = {
  dispatch: PropTypes.func.isRequired,
  domains: PropTypes.array,
  formState: PropTypes.object.isRequired,
  session: PropTypes.object.isRequired,
};

DomainIdField.defaultProps = {
  domains: [],
};

const select = state => ({
  domains: (state.domains || {}).items,
});

export default connect(select)(DomainIdField);
