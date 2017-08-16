
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { loadItem, unloadItem } from '../../actions';
import ItemHeader from '../../components/ItemHeader';
import Loading from '../../components/Loading';
import NotFound from '../../components/NotFound';
import Sections from '../../components/Sections';
import PageContext from './PageContext';

class Page extends Component {

  componentDidMount() {
    const { page } = this.props;
    if (!page) {
      this._load(this.props);
    } else {
      document.title = page.name;
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.id !== this.props.id && !nextProps.page) {
      this._load(nextProps);
    }
    if (nextProps.page) {
      document.title = nextProps.page.name;
      if (nextProps.page.pathAlias === nextProps.id &&
        nextProps.page.pathAlias !== nextProps.page.path) {
        nextProps.history.replace(`/${nextProps.page.path}`);
      }
    }
  }

  componentWillUnmount() {
    const { dispatch, id } = this.props;
    dispatch(unloadItem('pages', id));
  }

  _load(props) {
    const { dispatch, id } = props;
    dispatch(loadItem('pages', id, { populate: true }));
  }

  render() {
    const { notFound, page, session } = this.props;

    let actions;
    let contents;
    if (page) {
      contents = <Sections align={page.align} sections={page.sections} />;
      if (session && (session.userId.administrator ||
        (page.domainId &&
          session.userId.administratorDomainId === page.domainId))) {
        actions = [
          <Link key="map" to={`/pages/${page._id}/map`}>Map</Link>,
        ];
      }
    } else if (notFound) {
      contents = <NotFound />;
    } else {
      contents = <Loading />;
    }

    return (
      <main>
        <ItemHeader category="pages" item={page} actions={actions} />
        {contents}
        <PageContext align={(page || {}).align}
          filter={page ? { 'sections.pages.id': page._id } : undefined} />
      </main>
    );
  }
}

Page.propTypes = {
  dispatch: PropTypes.func.isRequired,
  page: PropTypes.object,
  history: PropTypes.any.isRequired,
  id: PropTypes.string.isRequired,
  notFound: PropTypes.bool,
  session: PropTypes.shape({
    userId: PropTypes.shape({
      administrator: PropTypes.bool,
      administratorDomainId: PropTypes.string,
    }),
  }),
};

Page.defaultProps = {
  notFound: undefined,
  page: undefined,
  session: undefined,
};

const select = (state, props) => {
  const id = props.match.params.id;
  return {
    id,
    notFound: state.notFound[id],
    page: state[id],
    session: state.session,
  };
};

export default connect(select)(Page);
