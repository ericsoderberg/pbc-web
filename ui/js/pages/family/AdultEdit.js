
import React, { Component, PropTypes } from 'react';
import { getItems } from '../../actions';
import FormField from '../../components/FormField';
import FormState from '../../utils/FormState';

export default class AdultEdit extends Component {

  constructor(props) {
    super(props);
    this._onChangeEmail = this._onChangeEmail.bind(this);
    this._onToggle = this._onToggle.bind(this);
    const { adult, defaultActive, onChange } = props;
    this.state = {
      active: defaultActive, formState: new FormState(adult, onChange),
    };
  }

  componentWillReceiveProps(nextProps) {
    const { adult, onChange } = nextProps;
    this.setState({ formState: new FormState(adult, onChange) });
  }

  _onToggle() {
    this.setState({ active: !this.state.active });
  }

  _loadUser(email) {
    const { formState } = this.state;
    getItems('users',
      { filter: { email }, select: 'name', sort: 'name' })
    .then((users) => {
      if (users.length === 1) {
        const user = users[0];
        formState.set({ name: user.name, phone: user.phone });
      }
    })
    .catch(error => console.error('!!! Adult catch', error));
  }

  _onChangeEmail(event) {
    const { formState } = this.state;
    const email = event.target.value;
    formState.set('email', email);

    // TODO: Don't do this if there isn't a session
    clearTimeout(this._loadTimer);
    this._loadTimer = setTimeout(() => {
      this._loadUser(email);
    }, 100);
  }

  render() {
    const { onRemove } = this.props;
    const { active, formState } = this.state;
    const adult = formState.object;
    const user = adult.userId || {};

    let contents;
    if (active) {
      contents = (
        <fieldset className="form__fields">
          <FormField label="Name">
            <input name="name" value={adult.name || user.name || ''}
              onChange={formState.change('name')} />
          </FormField>
          <FormField name="email" label="Email">
            <input name="email" value={adult.email || user.email || ''}
              onChange={this._onChangeEmail} />
          </FormField>
          <FormField label="Phone">
            <input name="phone" value={adult.phone || user.phone || ''}
              onChange={formState.change('phone')} />
          </FormField>
          <FormField label="Relation" help="e.g. mother, father, aunt">
            <input name="relation" value={adult.relation || ''}
              onChange={formState.change('relation')} />
          </FormField>
        </fieldset>
      );
    }

    let removeControl;
    if (onRemove) {
      removeControl = (
        <div className="box--row box--static">
          <button type="button" className="button-plain" onClick={onRemove}>
            remove
          </button>
        </div>
      );
    }

    return (
      <div>
        <div type="button" className="form-item">
          <button type="button" className="button-plain form-item__control"
            onClick={this._onToggle}>
            <h3>{adult.name || user.name }</h3>
          </button>
          {removeControl}
        </div>
        {contents}
      </div>
    );
  }
}

AdultEdit.propTypes = {
  adult: PropTypes.object.isRequired,
  defaultActive: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func,
};

AdultEdit.defaultProps = {
  defaultActive: false,
  onRemove: undefined,
};
