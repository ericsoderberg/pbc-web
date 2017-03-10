
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { getSite, getItem, deleteSession } from '../../actions';
import Sections from '../../components/Sections';
import Section from '../../components/Section';
import FacebookIcon from '../../icons/Facebook';
import InstagramIcon from '../../icons/Instagram';
import TwitterIcon from '../../icons/Twitter';
import VimeoIcon from '../../icons/Vimeo';
import YouTubeIcon from '../../icons/YouTube';
import SearchIcon from '../../icons/Search';
import Button from '../../components/Button';
import Stored from '../../components/Stored';
import Loading from '../../components/Loading';
import Logo from '../../components/Logo';
import { isDarkBackground } from '../../utils/Color';

class Home extends Component {

  constructor() {
    super();
    this._onResize = this._onResize.bind(this);
    this._layout = this._layout.bind(this);
    this._signOut = this._signOut.bind(this);
    this._siteReady = this._siteReady.bind(this);
    this._showMenu = this._showMenu.bind(this);
    this._hideMenu = this._hideMenu.bind(this);
    this._onSearch = this._onSearch.bind(this);
    this.state = { menuHeight: 0, showMenu: false };
  }

  componentDidMount() {
    const { site } = this.props;
    if (!site) {
      getSite()
      .then(this._siteReady)
      .catch(error => console.error('!!! Home catch', error));
    } else {
      this._siteReady(site)
      .catch(error => console.error('!!! Home re-catch', error));
    }
    window.addEventListener('resize', this._onResize);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.page && !this.props.page) {
      this._layoutNeeded = true;
    }
  }

  componentDidUpdate() {
    if (this._layoutNeeded) {
      this._layoutNeeded = false;
      this._layout();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._onResize);
    clearTimeout(this._resizeTimer);
  }

  _siteReady(site) {
    const { page } = this.props;
    document.title = site.name;
    this._layout();
    if (page) {
      return Promise.resolve();
    } else if (!page && site.homePageId) {
      return getItem('pages', site.homePageId._id,
        { cache: true, populate: true });
    }
    return Promise.reject('No home page');
  }

  _signOut() {
    deleteSession()
    .then(() => this.context.router.go('/'))
    .catch(error => console.error('!!! Home _signOut catch', error));
  }

  _onResize() {
    clearTimeout(this._resizeTimer);
    this._resizeTimer = setTimeout(this._layout, 20); // debounce
  }

  _layout() {
    if (window.innerWidth < 700 && this._menuRef) {
      const rect = this._menuRef.getBoundingClientRect();
      this.setState({ menuHeight: rect.height, showMenu: false });
    } else {
      this.setState({ menuHeight: 0, showMenu: false });
    }
  }

  _showMenu() {
    this.setState({ showMenu: true });
  }

  _hideMenu() {
    this.setState({ showMenu: false });
  }

  _onSearch(event) {
    const { searchText } = this.state;
    event.preventDefault();
    this.context.router.push(`/search?q=${searchText}`);
  }

  _renderSession() {
    const { session } = this.props;
    let contents;
    if (session && session.token) {
      contents = [
        <Link key="name" to={`/users/${session.userId._id}/edit`}>
          {session.userId.name}
        </Link>,
        <a key="control" className="home__sign-out" onClick={this._signOut}>
          <span className="link__text">Sign Out</span>
        </a>,
      ];
    } else {
      contents = <Button path="/sign-in">Sign In</Button>;
    }
    return <div className="home__session">{contents}</div>;
  }

  _renderMenuLinks() {
    const { page } = this.props;
    const links = [
      <Link key="search" to="/search">Search</Link>,
    ];
    if (page) {
      page.sections.filter(section => section.type === 'pages')
      .forEach((section) => {
        section.pages.forEach((sectionPage) => {
          const actualPage = sectionPage.id; // how the backend returns it
          const path = actualPage.path ? `/${actualPage.path}` :
            `/pages/${actualPage._id}`;
          links.push(<Link key={path} to={path}>{actualPage.name}</Link>);
        });
      });

      const calendarSections =
        page.sections.filter(section => section.type === 'calendar');
      calendarSections.forEach((section) => {
        const calendar = section.calendarId;
        const path = `/calendars/${calendar.path || calendar._id}`;
        links.push(<Link key={path} to={path}>{calendar.name}</Link>);
      });
      if (calendarSections.length === 0) {
        links.push(<Link key="calendar" to="/calendar">Calendar</Link>);
      }

      page.sections.filter(section => section.type === 'library')
      .forEach((section) => {
        const library = section.libraryId;
        const path = `/libraries/${library.path || library._id}`;
        links.push(<Link key={path} to={path}>Library</Link>);
      });
    }
    return links;
  }

  _renderSplash() {
    const { site } = this.props;
    return (
      <Section key="splash" className="home__splash">
        <div>
          <Logo className="home__splash-logo" />
          <h1>{site.name}</h1>
          <h2>{site.slogan}</h2>
        </div>
      </Section>
    );
  }

  _renderFooter() {
    const { page, session, site } = this.props;

    let socialLinks;
    if (site.socialUrls && site.socialUrls.length > 0) {
      socialLinks = site.socialUrls.map((url) => {
        let contents;
        if (url.match(/facebook/)) {
          contents = <FacebookIcon />;
        } else if (url.match(/instagram/)) {
          contents = <InstagramIcon />;
        } else if (url.match(/twitter/)) {
          contents = <TwitterIcon />;
        } else if (url.match(/vimeo/)) {
          contents = <VimeoIcon />;
        } else if (url.match(/youtube/)) {
          contents = <YouTubeIcon />;
        } else {
          contents = site;
        }
        return <a key={url} href={url}>{contents}</a>;
      });
    }

    let logo;
    if (site && site.logo) {
      logo = <img className="home__logo logo" alt="logo" src={site.logo.data} />;
    }

    const sessionControl = this._renderSession();

    let editControl;
    if (page && session && session.userId.administrator) {
      editControl = <Link to={`/pages/${page._id}/edit`}>Edit</Link>;
    }

    return (
      <Section key="footer" className="home__footer">
        <div>
          <div className="footer__links">
            <div className="home__brand">
              {logo}
              <div className="home__social">
                {socialLinks}
              </div>
            </div>
            {editControl}
            {sessionControl}
          </div>
          <footer className="footer">
            <a href={`maps://?daddr=${encodeURIComponent(site.address)}`}>
              {site.address}
            </a>
            <a href={`tel:${site.phone}`}>{site.phone}</a>
            <span>{site.copyright}</span>
          </footer>
        </div>
      </Section>
    );
  }

  _renderContents() {
    const { page, site } = this.props;
    const { searchText, showMenu } = this.state;

    const splash = this._renderSplash();

    let sections;
    if (page) {
      sections = (
        <Sections key="page" align={page.align}
          sections={page.sections} />
      );
    } else {
      sections = <Loading key="page" />;
    }

    const menuControlClasses = ['home__menu-control'];
    const menuClasses = ['home__menu'];
    const menuStyle = { backgroundColor: '#fff' };
    if (showMenu) {
      menuClasses.push('home__menu--active');
    }
    if (site && site.color) {
      menuStyle.backgroundColor = site.color;
      if (isDarkBackground(site.color)) {
        menuStyle.push('dark-background');
        if (showMenu) {
          menuControlClasses.push('dark-background');
        }
      }
    }
    const links = this._renderMenuLinks();
    const menu = (
      <div key="menu" ref={(ref) => { this._menuRef = ref; }}
        className={menuClasses.join(' ')} style={menuStyle}>
        {links}
      </div>
    );

    const search = (
      <form key="search" className="home__search" onSubmit={this._onSearch}>
        <input type="text" placeholder="Search" value={searchText || ''}
          onChange={e => this.setState({ searchText: e.target.value })} />
        <button className="button-icon" type="submit"
          onClick={this._onSearch}>
          <SearchIcon />
        </button>
      </form>
    );

    const footer = this._renderFooter();

    return [
      menu,
      <header key="header" className="home__header">
        <Button className={menuControlClasses.join(' ')} plain={true}
          onClick={showMenu ? undefined : this._showMenu}>
          menu
        </Button>
      </header>,
      splash,
      sections,
      search,
      footer,
    ];
  }

  render() {
    const { site } = this.props;
    const { menuHeight, showMenu } = this.state;

    let contents;
    let style;
    if (site) {
      contents = this._renderContents();
      if (!showMenu) {
        style = { transform: `translateY(-${menuHeight}px)` };
      }
    } else {
      contents = <Loading />;
    }

    return (
      <main className="home" style={style}
        onClick={showMenu ? this._hideMenu : undefined} >
        {contents}
      </main>
    );
  }
}

Home.propTypes = {
  page: PropTypes.object,
  session: PropTypes.shape({
    token: PropTypes.any,
  }),
  site: PropTypes.object,
};

Home.defaultProps = {
  page: undefined,
  session: undefined,
  site: undefined,
};

Home.contextTypes = {
  router: PropTypes.any,
};

const select = (state) => {
  let page;
  if (state.site && state.pages) {
    page = state.pages[state.site.homePageId._id];
  }
  return {
    page,
    session: state.session,
    site: state.site,
  };
};

export default Stored(Home, select);
