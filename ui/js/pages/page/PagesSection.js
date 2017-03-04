
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { getItem } from '../../actions';
import Image from '../../components/Image';
import Button from '../../components/Button';

export default class PagesSection extends Component {

  constructor() {
    super();
    this.state = { pages: {} };
  }

  componentDidMount() {
    this._load(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this._load(nextProps);
  }

  _load(props) {
    // When editing, we have id's but not names, get the names we need
    (props.pages || []).forEach((pageRef) => {
      if (typeof pageRef.id === 'string' &&
        !this.state.pages[pageRef.id]) {
        getItem('pages', pageRef.id, { select: 'name path' })
        .then((page) => {
          const pages = { ...this.state.pages };
          pages[pageRef.id] = page;
          this.setState({ pages });
        })
        .catch(error => console.error('!!! PageSummaries catch', error));
      }
    });
  }

  render() {
    const { className, pages } = this.props;

    const classes = ['page-summaries'];
    if (className) {
      classes.push(className);
    }

    const links = (pages || []).map((pageRef) => {
      let page;
      if (typeof pageRef.id === 'object') {
       // populated on server
        page = pageRef.id;
      } else {
        // populated via _load
        page = this.state.pages[pageRef.id];
      }
      return { pageRef, page };
    })
    .filter(context => context.page)
    .map((context, index) => {
      const { page, pageRef } = context;
      const path = page.path ? `/${page.path}` : `/pages/${page._id}`;
      const style = { transitionDelay: `${100 + (100 * index)}ms` };
      let link;
      if (pageRef.image) {
        link = (
          <Link key={page._id} className="page-tile page-summary" to={path}
            style={style}>
            <Image image={pageRef.image} />
            <Button>{page.name}</Button>
          </Link>
        );
      } else {
        link = (
          <Button key={page._id} className="page-summary"
            circle={true} path={path} style={style}>
            {page.name}
          </Button>
        );
      }
      return link;
    });

    return (
      <div className={classes.join(' ')}>
        {links}
      </div>
    );
  }
}

PagesSection.propTypes = {
  className: PropTypes.string,
  pages: PropTypes.array,
};

PagesSection.defaultProps = {
  className: undefined,
  pages: [],
};
