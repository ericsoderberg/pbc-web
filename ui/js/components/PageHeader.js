"use strict";
import React, { Component, PropTypes } from 'react';
import { getSite } from '../actions';
import BackIcon from '../icons/Back';
import Search from './Search';
import Button from './Button';

export default class PageHeader extends Component {

  constructor () {
    super();
    this._onHome = this._onHome.bind(this);
    this._onBack = this._onBack.bind(this);
    this._toggleMenu = this._toggleMenu.bind(this);
    this.state = {};
  }

  componentDidMount () {
    getSite()
    .then(site => {
      this.setState({ site: site });
    });
  }

  _onHome () {
    this.context.router.push('/');
  }

  _onBack () {
    const { back } = this.props;
    if (typeof back === 'string') {
      this.context.router.push(back);
    } else {
      this.context.router.goBack();
    }
  }

  _toggleMenu () {
    this.setState({ showMenu: ! this.state.showMenu });
  }

  render () {
    const {
      title, searchText, onSearch, actions, back, homer,
      focusOnSearch, responsive
    } = this.props;
    const { showMenu, site } = this.state;
    let classes = ["page-header"];
    if (responsive && actions && actions.length > 1) {
      classes.push("page-header--responsive");
    }

    let navControl;
    if (homer) {
      let contents;
      let classes = ["page-header__nav-control"];
      if (site && site.logo) {
        contents = <img className="page-header__logo" src={site.logo.data} />;
        classes.push('button-icon');
      } else {
        contents = 'Home';
        classes.push('button-header');
      }
      navControl = (
        <button className={classes.join(' ')} onClick={this._onHome}>
          {contents}
        </button>
      );
    } else if (back) {
      navControl = (
        <button className="button-icon page-header__nav-control"
          onClick={this._onBack}>
          <BackIcon />
        </button>
      );
    }

    let titleElement;
    if (title) {
      titleElement = <h1 className="page-header__title">{title}</h1>;
    }

    let menu;
    if (actions || onSearch) {
      let classes = ["page-header__menu"];
      if (showMenu) {
        classes.push("page-header__menu--active");
      }
      let search;
      if (onSearch) {
        search = (
          <Search ref="search" responsive={false}
            value={searchText} onChange={onSearch}
            focusOnMount={focusOnSearch} />
        );
      }
      menu = (
        <div className={classes.join(' ')}>
          <Button className="page-header__menu-control" label='menu'
            onClick={this._toggleMenu} />
          <nav className="page-header__actions">
            {search}
            {actions}
          </nav>
        </div>
      );
    }

    return (
      <header className={classes.join(' ')}>
        {navControl}
        {titleElement}
        {menu}
      </header>
    );
  }
};

PageHeader.propTypes = {
  actions: PropTypes.arrayOf(PropTypes.element),
  back: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  focusOnSearch: PropTypes.bool,
  homer: PropTypes.bool,
  onSearch: PropTypes.func,
  responsive: PropTypes.bool,
  searchText: PropTypes.string,
  title: PropTypes.string
};

PageHeader.defaultProps = {
  responsive: true
};

PageHeader.contextTypes = {
  router: PropTypes.any
};
