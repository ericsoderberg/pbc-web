import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { loadCategory, unloadCategory } from '../../actions';
import FormField from '../../components/FormField';
import Button from '../../components/Button';

class UserDomains extends Component {

  constructor() {
    super();
    this._onToggle = this._onToggle.bind(this);
    this._get = this._get.bind(this);
    this.state = { domains: [], active: false };
  }

  componentDidUpdate() {
    if (this._scrollNeeded) {
      this._scrollNeeded = false;
      const rect = this._containerRef.getBoundingClientRect();
      window.scrollBy(0, rect.top);
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch(unloadCategory('domains'));
  }

  _get() {
    const { dispatch } = this.props;
    const { active } = this.state;
    if (active) {
      dispatch(loadCategory('domains', { sort: 'name' }));
    }
  }

  _onToggle() {
    this.setState({ active: !this.state.active }, this._get);
  }

  render() {
    const { domains, formState } = this.props;
    const { active } = this.state;
    const user = formState.object;

    let field;
    if (active) {
      const items = domains.map((domain) => {
        const classNames = ['choice'];
        const checked = (user.domainIds || []).some(id => (id === domain._id));
        return (
          <div key={domain._id} className={classNames.join(' ')}>
            <input type="checkbox"
              checked={checked}
              id={domain._id}
              onChange={formState.toggleIn('domainIds', domain._id)} />
            <label htmlFor={domain._id}>{domain.name}</label>
          </div>
        );
      });

      field = <FormField key="resources">{items}</FormField>;
    }

    return (
      <fieldset ref={(ref) => { this._containerRef = ref; }}
        className="form__fields">
        <div type="button" className="form-item">
          <Button secondary={true}
            label="Domains"
            onClick={this._onToggle} />
        </div>
        {field}
      </fieldset>
    );
  }
}

UserDomains.propTypes = {
  dispatch: PropTypes.func.isRequired,
  domains: PropTypes.array,
  formState: PropTypes.object.isRequired,
};

UserDomains.defaultProps = {
  domains: [],
};

const select = state => ({
  domains: (state.domains || {}).items,
});

export default connect(select)(UserDomains);
