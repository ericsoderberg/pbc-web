
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { getItem } from '../../actions';
import ItemHeader from '../../components/ItemHeader';
import Loading from '../../components/Loading';
import NotFound from '../../components/NotFound';
import Stored from '../../components/Stored';
import Sections from '../../components/Sections';
import PageContext from './PageContext';

class Page extends Component {

  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {
    if (!this.props.page) {
      this._load(this.props);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.params.id !== this.props.params.id &&
      !nextProps.page) {
      this._load(nextProps);
    }
    if (nextProps.page) {
      document.title = nextProps.page.name;
    }
  }

  _load(props) {
    getItem('pages', props.params.id, { cache: true, populate: true })
    .catch((error) => {
      console.error('!!! Page catch', error);
      this.setState({ error });
    });
  }

  render() {
    const { page, session } = this.props;
    const { error } = this.state;

    let actions;
    let contents;
    if (page) {
      contents = <Sections align={page.align} sections={page.sections} />;
      if (session && (session.userId.administrator ||
        session.userId.administratorDomainId === page.domainId)) {
        actions = [
          <Link key="map" to={`/pages/${page._id}/map`}>Map</Link>,
        ];
      }
    } else if (error) {
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
  page: PropTypes.object,
  params: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
  session: PropTypes.shape({
    userId: PropTypes.shape({
      administrator: PropTypes.bool,
      administratorDomainId: PropTypes.string,
    }),
  }),
};

Page.defaultProps = {
  page: undefined,
  session: undefined,
};

const select = (state, props) => {
  let page;
  if (state.pages) {
    page = state.pages[props.params.id];
  }
  return { page, session: state.session };
};

export default Stored(Page, select);
