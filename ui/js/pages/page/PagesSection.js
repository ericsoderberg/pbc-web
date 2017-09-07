
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Image from '../../components/Image';
import Button from '../../components/Button';
import RightIcon from '../../icons/Right';

export default class PagesSection extends Component {

  render() {
    const { className, pages } = this.props;

    const classes = ['pages-section'];
    if (className) {
      classes.push(className);
    }

    const links = (pages || []).map((pageRef) => {
      const page = pageRef.id;
      return { pageRef, page };
    })
      .filter(context => context.page)
      .map((context, index) => {
        const { page, pageRef } = context;
        const path = page.path ? `/${page.path}` : `/pages/${page._id}`;
        const style = { transitionDelay: `${100 + (50 * index)}ms` };
        const key = page._id || index;
        let link;
        if (pageRef.image) {
          link = (
            <Link key={key}
              className="page-tile pages-section__page"
              to={path}
              style={style}>
              <Image image={pageRef.image} />
              <Button>{page.name}</Button>
            </Link>
          );
        } else if (pages.length === 1) {
          link = (
            <Button key={key}
              className="pages-section__page"
              plain={true}
              path={path}
              style={style}>
              <div className="pages-section__name">
                <h2>{page.name}</h2>
                <RightIcon className="anchor__indicator" />
              </div>
            </Button>
          );
        } else {
          link = (
            <Button key={key}
              className="pages-section__page"
              circle={true}
              path={path}
              style={style}>
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
