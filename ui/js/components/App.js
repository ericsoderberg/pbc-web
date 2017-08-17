
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Redirect, Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import { loadSite, haveSession } from '../actions';
import routes from '../routes';
import Button from './Button';
import MainNav from './MainNav';

const PrivateRoute = ({ component, ...rest }) => (
  <Route {...rest}
    render={props => (
      haveSession() ? (
        React.createElement(component, props)
      ) : (
        <Redirect to={{
          pathname: '/sign-in',
          state: { nextPathname: props.location.pathname },
        }} />
      )
    )} />
);

PrivateRoute.propTypes = {
  component: PropTypes.any.isRequired,
  location: PropTypes.object,
};

PrivateRoute.defaultProps = {
  location: undefined,
};

let lastPath;

class App extends Component {

  constructor(props) {
    super(props);
    this._onToggle = this._onToggle.bind(this);
    this.state = this._stateFromProps(props);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(loadSite());
    // this._hideNavControl();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ ...this._stateFromProps(nextProps) });
  }

  componentDidUpdate() {
    // this._hideNavControl();
    if (window.location.pathname !== lastPath) {
      lastPath = window.location.pathname;
      window.scrollTo(0, 0);
    }
  }

  _stateFromProps(props) {
    const { session } = props;
    return {
      navigable: (session &&
        (session.userId.administrator || session.userId.domainIds.length > 0)),
    };
  }

  // _hideNavControl() {
  //   clearTimeout(this._navTimer);
  //   this._navTimer = setTimeout(() => {
  //     const { navActive, navigable } = this.state;
  //     console.log('!!! _hideNavControl', navigable, navActive, window.scrollY);
  //     if (navigable && !navActive &&
  //       window.innerWidth < 700) {
  //       const navControl = this._navControlRef;
  //       if (navControl) {
  //         console.log('!!! scrollTo', findDOMNode(navControl).offsetHeight);
  //         window.scrollTo(0, findDOMNode(navControl).offsetHeight);
  //       }
  //     }
  //   }, 40);
  // }

  _onToggle() {
    this.setState({ navActive: !this.state.navActive });
    window.scrollTo(0, 0);
  }

  render() {
    const { navActive, navigable } = this.state;
    const classNames = ['app'];

    let nav;
    let navControl;
    if (navigable) {
      nav = <MainNav onClick={this._onToggle} />;
      if (navActive) {
        classNames.push('app--nav');
      } else {
        navControl = (
          <Button className="app__nav-control" onClick={this._onToggle}>
            admin
          </Button>
        );
      }
    }

    const routeElements = routes.map(route =>
      (route.private ?
        <PrivateRoute key={route.path} {...route} /> :
        <Route key={route.path} {...route} />));
    const content = <Switch>{routeElements}</Switch>;

    return (
      <div className={classNames.join(' ')}>
        {navControl}
        {nav}
        <div className="app__content">
          {content}
        </div>
      </div>
    );
  }
}

App.propTypes = {
  dispatch: PropTypes.func.isRequired,
  session: PropTypes.shape({
    userId: PropTypes.shape({
      administrator: PropTypes.bool,
      domainIds: PropTypes.arrayOf(PropTypes.string),
    }),
  }),
};

App.defaultProps = {
  session: undefined,
};

App.contextTypes = {
  router: PropTypes.any,
};

const select = state => ({
  session: state.session,
});

export default connect(select, null, null, { pure: false })(App);
