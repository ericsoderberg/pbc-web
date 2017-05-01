
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { loadCategory, unloadCategory } from '../../actions';
import FormField from '../../components/FormField';
import SectionsFormContents from '../../components/SectionsFormContents';
import DateInput from '../../components/DateInput';

const SECTION_TYPES = [
  'text', 'image', 'event', 'library', 'pages', 'files',
];

class NewsletterFormContents extends Component {

  constructor() {
    super();
    this._onAddEvent = this._onAddEvent.bind(this);
    this._changeEvent = this._changeEvent.bind(this);
    this._removeEvent = this._removeEvent.bind(this);
    this.state = { domains: [] };
  }

  componentDidMount() {
    const { dispatch, formState, session } = this.props;

    if (session.userId.administrator) {
      dispatch(loadCategory('domains', { sort: 'name' }));
    } else if (session.userId.administratorDomainId) {
      formState.change('domainId')(session.userId.administratorDomainId);
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch(unloadCategory('domains'));
  }

  _onAddEvent() {
    const newsletter = this.props.formState.object;
    const eventIds = (newsletter.eventIds || []).slice(0);
    eventIds.push({});
    this.props.formState.set('eventIds', eventIds);
  }

  _changeEvent(index) {
    return (suggestion) => {
      const newsletter = this.props.formState.object;
      const eventIds = (newsletter.eventIds || []).slice(0);
      eventIds[index] = { _id: suggestion._id, name: suggestion.name };
      this.props.formState.set('eventIds', eventIds);
    };
  }

  _removeEvent(index) {
    return () => {
      const newsletter = this.props.formState.object;
      const eventIds = (newsletter.eventIds || []).slice(0);
      eventIds.splice(index, 1);
      this.props.formState.set('eventIds', eventIds);
    };
  }

  render() {
    const { className, domains, formState, session } = this.props;
    const newsletter = formState.object;

    let administeredBy;
    if (session.userId.administrator) {
      const options = domains.map(domain => (
        <option key={domain._id} label={domain.name} value={domain._id} />
      ));
      options.unshift(<option key={0} />);
      administeredBy = (
        <FormField label="Administered by">
          <select name="domainId" value={newsletter.domainId || ''}
            onChange={formState.change('domainId')}>
            {options}
          </select>
        </FormField>
      );
    }

    return (
      <div className={className}>
        <fieldset className="form__fields">
          <FormField label="Name">
            <input name="name" value={newsletter.name || ''}
              onChange={formState.change('name')} />
          </FormField>
          <FormField label="Date">
            <DateInput value={newsletter.date || ''}
              onChange={formState.change('date')} />
          </FormField>
        </fieldset>
        <SectionsFormContents formState={formState} types={SECTION_TYPES} />
        <fieldset className="form__fields">
          {administeredBy}
        </fieldset>
      </div>
    );
  }
}

NewsletterFormContents.propTypes = {
  className: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
  domains: PropTypes.array,
  formState: PropTypes.object.isRequired,
  session: PropTypes.object.isRequired,
};

NewsletterFormContents.defaultProps = {
  className: undefined,
  domains: [],
};

const select = state => ({
  domains: (state.domains || {}).items || [],
  session: state.session,
});

export default connect(select)(NewsletterFormContents);
