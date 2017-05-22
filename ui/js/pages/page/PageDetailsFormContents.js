
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { loadCategory, unloadCategory } from '../../actions';
import FormField from '../../components/FormField';
import Button from '../../components/Button';

class PageDetailsFormContents extends Component {

  constructor() {
    super();
    this._onToggle = this._onToggle.bind(this);
    this.state = { active: false, domains: [] };
  }

  componentDidMount() {
    const { formState, session } = this.props;
    if (session.userId.administratorDomainId) {
      formState.change('domainId')(session.userId.administratorDomainId);
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch(unloadCategory('domains'));
  }

  _get() {
    const { dispatch, session } = this.props;
    if (session.userId.administrator) {
      dispatch(loadCategory('domains', { sort: 'name' }));
    }
  }

  _onToggle() {
    const { domains } = this.props;
    const active = !this.state.active;
    if (active && domains.length === 0) {
      this._get();
    }
    this.setState({ active: !this.state.active });
  }

  render() {
    const { domains, formState, errors, session } = this.props;
    const { active } = this.state;
    const page = formState.object;

    let contents;
    if (active) {
      contents = [
        <FormField key="align" error={errors.align}>
          <input name="align" type="checkbox"
            checked={page.align !== 'start'}
            onChange={() => formState.set('align',
              page.align === 'start' ? 'center' : 'start')} />
          <label htmlFor="align">center</label>
        </FormField>,
        <FormField key="path" name="path" label="Url ID" help="unique url name"
          error={errors.path}>
          <input name="path" value={page.path || ''}
            onChange={formState.change('path')} />
        </FormField>,
        <FormField key="pathAlias" name="pathAlias"
          label="Url alias" help="alternate url name"
          error={errors.pathAlias}>
          <input name="pathAlias" value={page.pathAlias || ''}
            onChange={formState.change('pathAlias')} />
        </FormField>,
      ];

      let administeredBy;
      if (session.userId.administrator) {
        const options = domains.map(domain => (
          <option key={domain._id} label={domain.name} value={domain._id} />
        ));
        options.unshift(<option key={0} />);
        administeredBy = (
          <FormField key="admin" label="Administered by"
            error={errors.domainId}>
            <select name="domainId" value={page.domainId || ''}
              onChange={formState.change('domainId')}>
              {options}
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
  dispatch: PropTypes.func.isRequired,
  domains: PropTypes.array,
  errors: PropTypes.object,
  formState: PropTypes.object.isRequired,
  session: PropTypes.object.isRequired,
};

PageDetailsFormContents.defaultProps = {
  domains: [],
  errors: {},
};

const select = state => ({
  domains: (state.domains || {}).items || [],
  session: state.session,
});

export default connect(select)(PageDetailsFormContents);
