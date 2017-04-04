
import React, { Component, PropTypes } from 'react';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import createBrowserHistory from 'history/createBrowserHistory';
import { haveSession } from '../actions';
import Button from './Button';
import MainNav from './MainNav';
import Stored from './Stored';

import Home from '../pages/home/Home';
import AuditLog from '../pages/auditLog/AuditLog';
import Calendars from '../pages/calendar/Calendars';
import CalendarAdd from '../pages/calendar/CalendarAdd';
import Calendar from '../pages/calendar/Calendar';
import CalendarEdit from '../pages/calendar/CalendarEdit';
import Domains from '../pages/domain/Domains';
import DomainAdd from '../pages/domain/DomainAdd';
import Domain from '../pages/domain/Domain';
import DomainEdit from '../pages/domain/DomainEdit';
import EmailLists from '../pages/emailList/EmailLists';
import EmailListAdd from '../pages/emailList/EmailListAdd';
import EmailList from '../pages/emailList/EmailList';
import EmailListEdit from '../pages/emailList/EmailListEdit';
import EmailListSubscribe from '../pages/emailList/EmailListSubscribe';
import EmailListUnsubscribe from '../pages/emailList/EmailListUnsubscribe';
import Events from '../pages/event/Events';
import EventAdd from '../pages/event/EventAdd';
import Event from '../pages/event/Event';
import EventEdit from '../pages/event/EventEdit';
import Files from '../pages/file/Files';
import FormAdd from '../pages/form/FormAdd';
import FormEdit from '../pages/form/FormEdit';
import Forms from '../pages/form/Forms';
import FormTemplates from '../pages/formTemplate/FormTemplates';
import FormTemplateAdd from '../pages/formTemplate/FormTemplateAdd';
import FormTemplate from '../pages/formTemplate/FormTemplate';
import FormTemplateEdit from '../pages/formTemplate/FormTemplateEdit';
import Libraries from '../pages/library/Libraries';
import LibraryAdd from '../pages/library/LibraryAdd';
import Library from '../pages/library/Library';
import LibraryEdit from '../pages/library/LibraryEdit';
import Messages from '../pages/message/Messages';
import MessageAdd from '../pages/message/MessageAdd';
import Message from '../pages/message/Message';
import MessageEdit from '../pages/message/MessageEdit';
import Newsletters from '../pages/newsletter/Newsletters';
import NewsletterAdd from '../pages/newsletter/NewsletterAdd';
import Newsletter from '../pages/newsletter/Newsletter';
import NewsletterEdit from '../pages/newsletter/NewsletterEdit';
import Pages from '../pages/page/Pages';
import PageMap from '../pages/page/PageMap';
import PageAdd from '../pages/page/PageAdd';
import Page from '../pages/page/Page';
import PageEdit from '../pages/page/PageEdit';
import PaymentAdd from '../pages/payment/PaymentAdd';
import PaymentEdit from '../pages/payment/PaymentEdit';
import Payments from '../pages/payment/Payments';
import Resources from '../pages/resource/Resources';
import ResourcesCalendar from '../pages/resource/ResourcesCalendar';
import ResourceAdd from '../pages/resource/ResourceAdd';
import Resource from '../pages/resource/Resource';
import ResourceEdit from '../pages/resource/ResourceEdit';
import Search from '../pages/search/Search';
import SignIn from '../pages/session/SignIn';
import SignUp from '../pages/user/SignUp';
import VerifyEmail from '../pages/session/VerifyEmail';
import Users from '../pages/user/Users';
import UserAdd from '../pages/user/UserAdd';
import User from '../pages/user/User';
import UserEdit from '../pages/user/UserEdit';
import SiteEdit from '../pages/site/SiteEdit';

const PrivateRoute = ({ component, ...rest }) => (
  <Route {...rest} render={props => (
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
};

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
    window.scrollTo(0, 0);
  }

  _stateFromProps(props) {
    const { session } = props;
    return {
      navigable: (session &&
        (session.userId.administrator || session.userId.administratorDomainId)),
    };
  }

  _hideNavControl() {
    // clearTimeout(this._navTimer);
    // this._navTimer = setTimeout(() => {
    //   const { navActive, navigable } = this.state;
    //   console.log('!!! _hideNavControl', navigable, navActive, window.scrollY);
    //   if (navigable && !navActive &&
    //     window.innerWidth < 700) {
    //     const navControl = this._navControlRef;
    //     if (navControl) {
    //       console.log('!!! scrollTo', findDOMNode(navControl).offsetHeight);
    //       window.scrollTo(0, findDOMNode(navControl).offsetHeight);
    //     }
    //   }
    // }, 40);
  }

  _onToggle() {
    this.setState({ navActive: !this.state.navActive });
    window.scrollTo(0, 0);
  }

  render() {
    const { history } = this.props;
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

    const routes = (
      <Switch>
        <Route path="/" exact={true} component={Home} />

        <PrivateRoute path="/calendars" exact={true} component={Calendars} />
        <PrivateRoute path="/calendars/add" component={CalendarAdd} />
        <Route path="/calendars/:id" exact={true} component={Calendar} />
        <PrivateRoute path="/calendars/:id/edit" component={CalendarEdit} />

        <Route path="/calendar" component={Calendar} />

        <Route path="/search" component={Search} />

        <Route path="/sign-up" component={SignUp} />
        <Route path="/sign-in" component={SignIn} />
        <Route path="/verify-email" component={VerifyEmail} />

        <Route path="/users" exact={true} component={Users} />
        <Route path="/users/add" component={UserAdd} />
        <Route path="/users/:id" exact={true} component={User} />
        <Route path="/users/:id/edit" component={UserEdit} />

        <PrivateRoute path="/pages" exact={true} component={Pages} />
        <PrivateRoute path="/pages/add" component={PageAdd} />
        <Route path="/pages/:id" exact={true} component={Page} />
        <PrivateRoute path="/pages/:id/edit" component={PageEdit} />
        <PrivateRoute path="/pages/:id/map" component={PageMap} />

        <PrivateRoute path="/events" exact={true} component={Events} />
        <PrivateRoute path="/events/add" component={EventAdd} />
        <Route path="/events/:id" exact={true} component={Event} />
        <PrivateRoute path="/events/:id/edit" component={EventEdit} />

        <PrivateRoute path="/forms" exact={true} component={Forms} />
        <PrivateRoute path="/forms/add" component={FormAdd} />
        <PrivateRoute path="/forms/:id/edit" component={FormEdit} />

        <PrivateRoute path="/payments" exact={true} component={Payments} />
        <PrivateRoute path="/payments/add" component={PaymentAdd} />
        <PrivateRoute path="/payments/:id/edit" component={PaymentEdit} />

        <PrivateRoute path="/libraries" exact={true} component={Libraries} />
        <PrivateRoute path="/libraries/add" component={LibraryAdd} />
        <Route path="/libraries/:id" exact={true} component={Library} />
        <PrivateRoute path="/libraries/:id/edit" component={LibraryEdit} />

        <PrivateRoute path="/messages" exact={true} component={Messages} />
        <PrivateRoute path="/messages/add" component={MessageAdd} />
        <Route path="/messages/:id" exact={true} component={Message} />
        <PrivateRoute path="/messages/:id/edit" component={MessageEdit} />

        <PrivateRoute path="/form-templates" exact={true}
          component={FormTemplates} />
        <PrivateRoute path="/form-templates/add" component={FormTemplateAdd} />
        <PrivateRoute path="/form-templates/:id" exact={true}
          component={FormTemplate} />
        <PrivateRoute path="/form-templates/:id/edit"
          component={FormTemplateEdit} />

        <Route path="/email-lists" exact={true} component={EmailLists} />
        <PrivateRoute path="/email-lists/add" component={EmailListAdd} />
        <PrivateRoute path="/email-lists/:id" exact={true}
          component={EmailList} />
        <PrivateRoute path="/email-lists/:id/edit" component={EmailListEdit} />
        <PrivateRoute path="/email-lists/:name/subscribe"
          component={EmailListSubscribe} />
        <PrivateRoute path="/email-lists/:name/unsubscribe"
          component={EmailListUnsubscribe} />

        <PrivateRoute path="/newsletters" exact={true} component={Newsletters} />
        <PrivateRoute path="/newsletters/add" component={NewsletterAdd} />
        <PrivateRoute path="/newsletters/:id" exact={true}
          component={Newsletter} />
        <PrivateRoute path="/newsletters/:id/edit" component={NewsletterEdit} />

        <PrivateRoute path="/domains" exact={true} component={Domains} />
        <PrivateRoute path="/domains/add" component={DomainAdd} />
        <PrivateRoute path="/domains/:id" exact={true} component={Domain} />
        <PrivateRoute path="/domains/:id/edit" component={DomainEdit} />

        <PrivateRoute path="/resources" exact={true} component={Resources} />
        <PrivateRoute path="/resources/add" component={ResourceAdd} />
        <PrivateRoute path="/resources/calendar" component={ResourcesCalendar} />
        <PrivateRoute path="/resources/:id" exact={true} component={Resource} />
        <PrivateRoute path="/resources/:id/edit" component={ResourceEdit} />

        <PrivateRoute path="/files" component={Files} />
        <PrivateRoute path="/site" component={SiteEdit} />
        <PrivateRoute path="/audit-log" component={AuditLog} />

        <Route path="/:id" component={Page} />
      </Switch>
    );

    return (
      <Router history={history}>
        <div className={classNames.join(' ')}>
          {navControl}
          {nav}
          <div className="app__content">
            {routes}
          </div>
        </div>
      </Router>
    );
  }
}

App.propTypes = {
  history: PropTypes.any.isRequired,
  session: PropTypes.shape({
    userId: PropTypes.shape({
      administrator: PropTypes.bool,
      administratorDomainId: PropTypes.string,
    }),
  }),
};

App.defaultProps = {
  history: createBrowserHistory(),
  session: undefined,
};

const select = state => ({
  session: state.session,
});

export default Stored(App, select);
