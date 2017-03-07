
import React, { Component, PropTypes } from 'react';
import { getItems } from '../../actions';
import FormField from '../../components/FormField';
import Button from '../../components/Button';

export default class PageDetailsFormContents extends Component {

  constructor() {
    super();
    this._onToggle = this._onToggle.bind(this);
    this.state = { active: false, domains: [] };
  }

  componentDidMount() {
    const { formState, session } = this.props;
    if (session.administratorDomainId) {
      formState.change('domainId')(session.administratorDomainId);
    }
  }

  _get() {
    const { session } = this.props;
    if (session.administrator) {
      getItems('domains', { sort: 'name' })
      .then(response => this.setState({ domains: response }))
      .catch(error => console.error('PageDetailsFormContents catch', error));
    }
  }

  _onToggle() {
    const { domains } = this.state;
    const active = !this.state.active;
    if (active && domains.length === 0) {
      this._get();
    }
    this.setState({ active: !this.state.active });
  }

  render() {
    const { formState, session } = this.props;
    const { active } = this.state;
    const page = formState.object;

    let contents;
    if (active) {
      contents = [
        <FormField key="align">
          <input name="align" type="checkbox"
            checked={page.align !== 'start'}
            onChange={() => formState.set('align',
              page.align === 'start' ? 'center' : 'start')} />
          <label htmlFor="align">center</label>
        </FormField>,
        <FormField key="path" name="path" label="Path"
          help="unique url name, only a-z and -">
          <input name="path" value={page.path || ''}
            onChange={formState.change('path')} />
        </FormField>,
      ];

      let administeredBy;
      if (session.administrator) {
        const domains = this.state.domains.map(domain => (
          <option key={domain._id} label={domain.name} value={domain._id} />
        ));
        domains.unshift(<option key={0} />);
        administeredBy = (
          <FormField key="admin" label="Administered by">
            <select name="domainId" value={page.domainId || ''}
              onChange={formState.change('domainId')}>
              {domains}
            </select>
          </FormField>
        );
        contents.push(administeredBy);
      }
    }

    return (
      <fieldset className="form__fields">
        <div type="button" className="form-item">
          <Button secondary={true} label="Details"
            onClick={this._onToggle} />
        </div>
        {contents}
      </fieldset>
    );
  }
}

PageDetailsFormContents.propTypes = {
  formState: PropTypes.object.isRequired,
  session: PropTypes.object.isRequired,
};
