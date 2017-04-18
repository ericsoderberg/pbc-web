import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { loadSite, postSite } from '../../actions';
import Form from '../../components/Form';
import SiteFormContents from './SiteFormContents';

class SiteEdit extends Component {

  constructor(props) {
    super(props);
    this._onUpdate = this._onUpdate.bind(this);
    this._onCancel = this._onCancel.bind(this);
    this.state = { site: props.site || {} };
  }

  componentDidMount() {
    const { dispatch, site } = this.props;
    document.title = 'Site';
    if (!site) {
      dispatch(loadSite());
    }
  }

  componentWillReceiveProps(nextProps) {
    const { router } = this.context;
    if (this.state.updating) {
      if (!nextProps.error) {
        router.history.goBack();
      } else {
        this.setState({ updating: false });
      }
    } else {
      this.setState({ site: nextProps.site || {} });
    }
  }

  _onUpdate(site) {
    const { dispatch } = this.props;
    this.setState({ updating: true });
    dispatch(postSite(site));
  }

  _onCancel() {
    const { router } = this.context;
    router.history.goBack();
  }

  render() {
    const { error, session } = this.props;
    const { site } = this.state;

    return (
      <Form title="Edit Site" submitLabel="Update" action="/api/site"
        FormContents={SiteFormContents} item={site} session={session}
        onSubmit={this._onUpdate} error={error} onCancel={this._onCancel} />
    );
  }
}

SiteEdit.propTypes = {
  dispatch: PropTypes.func.isRequired,
  error: PropTypes.object,
  session: PropTypes.object.isRequired,
  site: PropTypes.object,
};

SiteEdit.defaultProps = {
  error: undefined,
  site: undefined,
};

SiteEdit.contextTypes = {
  router: PropTypes.any,
};

const select = state => ({
  error: state.error,
  session: state.session,
  site: state.site,
});

export default connect(select)(SiteEdit);
