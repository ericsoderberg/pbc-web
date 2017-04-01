import React, { Component, PropTypes } from 'react';
import { getSite } from '../actions';
import BackIcon from '../icons/Back';
import Search from './Search';
import Button from './Button';

export default class PageHeader extends Component {

  constructor() {
    super();
    this._onHome = this._onHome.bind(this);
    this._onBack = this._onBack.bind(this);
    this._toggleMenu = this._toggleMenu.bind(this);
    this.state = {};
  }

  componentDidMount() {
    getSite()
    .then((site) => {
      this.setState({ site });
    });
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

  render() {
    const {
      title, searchText, onSearch, actions, back, homer,
      focusOnSearch, responsive,
    } = this.props;
    const { showMenu, site } = this.state;
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
          <button className={navClasses.join(' ')} onClick={this._onHome}>
            {contents}
          </button>
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
    if (actions || onSearch) {
      const menuClasses = ['page-header__menu'];
      if (showMenu) {
        menuClasses.push('page-header__menu--active');
      }
      let search;
      if (onSearch) {
        search = (
          <Search responsive={false}
            value={searchText} onChange={onSearch}
            focusOnMount={focusOnSearch} />
        );
      }
      menu = (
        <div className={menuClasses.join(' ')}>
          <Button className="page-header__menu-control" label="menu"
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
}

PageHeader.propTypes = {
  actions: PropTypes.arrayOf(PropTypes.element),
  back: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  focusOnSearch: PropTypes.bool,
  homer: PropTypes.bool,
  onSearch: PropTypes.func,
  responsive: PropTypes.bool,
  searchText: PropTypes.string,
  title: PropTypes.string,
};

PageHeader.defaultProps = {
  actions: [],
  back: false,
  focusOnSearch: false,
  homer: false,
  onSearch: undefined,
  responsive: true,
  searchText: '',
  title: undefined,
};

PageHeader.contextTypes = {
  router: PropTypes.any,
};
