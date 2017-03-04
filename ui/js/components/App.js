
import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import Button from './Button';
import MainNav from './MainNav';
import Stored from './Stored';

class App extends Component {

  constructor(props) {
    super(props);
    this._onToggle = this._onToggle.bind(this);
    this.state = this._stateFromProps(props);
  }

  componentDidMount() {
    this._hideNavControl();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ ...this._stateFromProps(nextProps) });
  }

  componentDidUpdate() {
    this._hideNavControl();
  }

  _stateFromProps(props) {
    const { session } = props;
    return {
      navigable: (session &&
        (session.administrator || session.administratorDomainId)),
    };
  }

  _hideNavControl() {
    clearTimeout(this._navTimer);
    this._navTimer = setTimeout(() => {
      const { navActive, navigable } = this.state;
      if (navigable && !navActive &&
        window.scrollY === 0 && window.innerWidth < 700) {
        const navControl = this._navControlRef;
        if (navControl) {
          window.scrollTo(0, findDOMNode(navControl).offsetHeight);
        }
      }
    }, 40);
  }

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
          <Button ref={(ref) => { this._navControlRef = ref; }}
            className="app__nav-control" onClick={this._onToggle}>
            admin
          </Button>
        );
      }
    }

    return (
      <div className={classNames.join(' ')}>
        {navControl}
        {nav}
        <div className="app__content">
          {this.props.children}
        </div>
      </div>
    );
  }
}

App.propTypes = {
  children: PropTypes.any.isRequired,
  session: PropTypes.shape({
    administrator: PropTypes.bool,
    administratorDomainId: PropTypes.string,
  }).isRequired,
};

const select = state => ({
  session: state.session,
});

export default Stored(App, select);
