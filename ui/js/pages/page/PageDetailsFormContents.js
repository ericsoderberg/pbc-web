
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FormField from '../../components/FormField';
import Button from '../../components/Button';
import DomainIdField from '../../components/DomainIdField';

export default class PageDetailsFormContents extends Component {

  constructor() {
    super();
    this._onToggle = this._onToggle.bind(this);
    this.state = { active: false };
  }

  _onToggle() {
    this.setState({ active: !this.state.active });
  }

  render() {
    const { formState, errors, session } = this.props;
    const { active } = this.state;
    const page = formState.object;

    let contents;
    if (active) {
      contents = [
        <FormField key="align" error={errors.align}>
          <input id="align"
            name="align"
            type="checkbox"
            checked={page.align !== 'start'}
            onChange={() => formState.set('align',
              page.align === 'start' ? 'center' : 'start')} />
          <label htmlFor="align">center</label>
        </FormField>,
        <FormField key="path"
          name="path"
          label="Url ID"
          help="unique url name"
          error={errors.path}>
          <input name="path"
            value={page.path || ''}
            onChange={formState.change('path')} />
        </FormField>,
        <FormField key="pathAlias"
          name="pathAlias"
          label="Url alias"
          help="alternate url name"
          error={errors.pathAlias}>
          <input name="pathAlias"
            value={page.pathAlias || ''}
            onChange={formState.change('pathAlias')} />
        </FormField>,
        <DomainIdField key="domain" formState={formState} session={session} />,
      ];
    }

    return (
      <fieldset className="form__fields">
        <div type="button" className="form-item">
          <Button secondary={true}
            label="Details"
            onClick={this._onToggle} />
        </div>
        {contents}
      </fieldset>
    );
  }
}

PageDetailsFormContents.propTypes = {
  errors: PropTypes.object,
  formState: PropTypes.object.isRequired,
  session: PropTypes.object.isRequired,
};

PageDetailsFormContents.defaultProps = {
  errors: {},
};
