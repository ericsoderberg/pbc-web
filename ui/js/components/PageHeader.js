import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import BackIcon from '../icons/Back';
import Search from './Search';
import Button from './Button';

class PageHeader extends Component {

  constructor() {
    super();
    this._onHome = this._onHome.bind(this);
    this._onBack = this._onBack.bind(this);
    this._toggleMenu = this._toggleMenu.bind(this);
    this._toggleFilters = this._toggleFilters.bind(this);
    this.state = {};
  }

  _onHome() {
    const { router } = this.context;
    router.history.push('/');
  }

  _onBack() {
    const { back } = this.props;
    const { router } = this.context;
    if (typeof back === 'string') {
      router.history.push(back);
    } else {
      router.history.goBack();
    }
  }

  _toggleMenu() {
    this.setState({ showMenu: !this.state.showMenu });
  }

  _toggleFilters() {
    this.setState({ showFilters: !this.state.showFilters });
  }

  render() {
    const {
      title, searchText, searchPlaceholder, onSearch, actions, back, homer,
      filters, focusOnSearch, responsive, site,
    } = this.props;
    const { showFilters, showMenu } = this.state;
    const classes = ['page-header'];
    if (responsive && actions &&
      (actions.length > 1 || (actions.length === 1 && onSearch))) {
      classes.push('page-header--responsive');
    }

    let navControl;
    if (homer) {
      let contents;
      const navClasses = ['page-header__nav-control'];
      if (site) {
        if (site.logo) {
          contents = (
            <img className="page-header__logo" alt="logo" src={site.logo.data} />
          );
          navClasses.push('button-plain');
        } else {
          contents = 'Home';
          navClasses.push('button-plain');
        }
        navControl = (
          <Link className={navClasses.join(' ')} to="/">
            {contents}
          </Link>
        );
      }
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
    if (actions) {
      const menuClasses = ['page-header__menu'];
      if (showMenu) {
        menuClasses.push('page-header__menu--active');
      }
      menu = (
        <div className={menuClasses.join(' ')}>
          <Button className="page-header__menu-control"
            label="menu"
            onClick={this._toggleMenu} />
          <nav className="page-header__actions">
            {actions}
          </nav>
        </div>
      );
    }

    let contents = (
      <header className={classes.join(' ')}>
        {navControl}
        {titleElement}
        {menu}
      </header>
    );

    if (onSearch) {
      let filterControl;
      let tertiary;
      if (filters && filters.length > 0) {
        filterControl = (
          <Button label="Filter" onClick={this._toggleFilters} />
        );
        if (showFilters) {
          tertiary = <div className="page-header__tertiary">{filters}</div>;
        }
      }
      contents = (
        <div>
          {contents}
          <div className="page-header__secondary">
            <Search responsive={false}
              placeholder={searchPlaceholder}
              value={searchText}
              onChange={onSearch}
              focusOnMount={focusOnSearch} />
            {filterControl}
          </div>
          {tertiary}
        </div>
      );
    }

    return contents;
  }
}

PageHeader.propTypes = {
  actions: PropTypes.arrayOf(PropTypes.element),
  back: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  filters: PropTypes.arrayOf(PropTypes.node),
  focusOnSearch: PropTypes.bool,
  homer: PropTypes.bool,
  onSearch: PropTypes.func,
  responsive: PropTypes.bool,
  searchPlaceholder: PropTypes.string,
  searchText: PropTypes.string,
  site: PropTypes.object,
  title: PropTypes.string,
};

PageHeader.defaultProps = {
  actions: [],
  back: false,
  filters: undefined,
  focusOnSearch: false,
  homer: false,
  onSearch: undefined,
  responsive: true,
  searchPlaceholder: undefined,
  searchText: '',
  site: undefined,
  title: undefined,
};

PageHeader.contextTypes = {
  router: PropTypes.any,
};

const select = state => ({
  site: state.site,
  session: state.session,
});

export default connect(select)(PageHeader);
