import { haveSession } from './actions';
import App from './components/App';
import Home from './pages/home/Home';
import Calendars from './pages/calendar/Calendars';
import CalendarAdd from './pages/calendar/CalendarAdd';
import Calendar from './pages/calendar/Calendar';
import CalendarEdit from './pages/calendar/CalendarEdit';
import Domains from './pages/domain/Domains';
import DomainAdd from './pages/domain/DomainAdd';
import Domain from './pages/domain/Domain';
import DomainEdit from './pages/domain/DomainEdit';
import EmailLists from './pages/emailList/EmailLists';
import EmailListAdd from './pages/emailList/EmailListAdd';
import EmailList from './pages/emailList/EmailList';
import EmailListEdit from './pages/emailList/EmailListEdit';
import EmailListSubscribe from './pages/emailList/EmailListSubscribe';
import EmailListUnsubscribe from './pages/emailList/EmailListUnsubscribe';
import Events from './pages/event/Events';
import EventAdd from './pages/event/EventAdd';
import Event from './pages/event/Event';
import EventEdit from './pages/event/EventEdit';
import Files from './pages/file/Files';
import FormAdd from './pages/form/FormAdd';
import FormEdit from './pages/form/FormEdit';
import Forms from './pages/form/Forms';
import FormTemplates from './pages/formTemplate/FormTemplates';
import FormTemplateAdd from './pages/formTemplate/FormTemplateAdd';
import FormTemplate from './pages/formTemplate/FormTemplate';
import FormTemplateEdit from './pages/formTemplate/FormTemplateEdit';
import Libraries from './pages/library/Libraries';
import LibraryAdd from './pages/library/LibraryAdd';
import Library from './pages/library/Library';
import LibraryEdit from './pages/library/LibraryEdit';
import Messages from './pages/message/Messages';
import MessageAdd from './pages/message/MessageAdd';
import Message from './pages/message/Message';
import MessageEdit from './pages/message/MessageEdit';
import Newsletters from './pages/newsletter/Newsletters';
import NewsletterAdd from './pages/newsletter/NewsletterAdd';
import Newsletter from './pages/newsletter/Newsletter';
import NewsletterEdit from './pages/newsletter/NewsletterEdit';
import Pages from './pages/page/Pages';
import PageMap from './pages/page/PageMap';
import PageAdd from './pages/page/PageAdd';
import Page from './pages/page/Page';
import PageEdit from './pages/page/PageEdit';
import PaymentAdd from './pages/payment/PaymentAdd';
import PaymentEdit from './pages/payment/PaymentEdit';
import Payments from './pages/payment/Payments';
import Resources from './pages/resource/Resources';
import ResourceAdd from './pages/resource/ResourceAdd';
import Resource from './pages/resource/Resource';
import ResourceEdit from './pages/resource/ResourceEdit';
import Search from './pages/search/Search';
import SignIn from './pages/session/SignIn';
import SignUp from './pages/user/SignUp';
import VerifyEmail from './pages/session/VerifyEmail';
import Users from './pages/user/Users';
import UserAdd from './pages/user/UserAdd';
import User from './pages/user/User';
import UserEdit from './pages/user/UserEdit';
import SiteEdit from './pages/site/SiteEdit';

const requireSession = (nextState, replace) => {
  if (!haveSession()) {
    replace({
      pathname: '/sign-in',
      state: { nextPathname: nextState.location.pathname },
    });
  }
};

export default {
  path: '/',
  component: App,
  indexRoute: { component: Home },
  childRoutes: [
    { path: 'calendars/add', component: CalendarAdd, onEnter: requireSession },
    { path: 'calendars/:id', component: Calendar },
    { path: 'calendars/:id/edit', component: CalendarEdit, onEnter: requireSession },
    { path: 'calendars', component: Calendars, onEnter: requireSession },
    { path: 'calendar', component: Calendar },
    { path: 'sign-up', component: SignUp },
    { path: 'sign-in', component: SignIn },
    { path: 'verify-email', component: VerifyEmail },
    { path: 'users/add', component: UserAdd },
    { path: 'users/:id', component: User },
    { path: 'users/:id/edit', component: UserEdit },
    { path: 'users', component: Users },
    { path: 'pages/add', component: PageAdd, onEnter: requireSession },
    { path: 'pages/:id', component: Page },
    { path: 'pages/:id/edit', component: PageEdit, onEnter: requireSession },
    { path: 'pages/:id/map', component: PageMap, onEnter: requireSession },
    { path: 'pages', component: Pages, onEnter: requireSession },
    { path: 'events/add', component: EventAdd, onEnter: requireSession },
    { path: 'events/:id', component: Event },
    { path: 'events/:id/edit', component: EventEdit, onEnter: requireSession },
    { path: 'events', component: Events, onEnter: requireSession },
    { path: 'forms/add', component: FormAdd, onEnter: requireSession },
    { path: 'forms/:id/edit', component: FormEdit, onEnter: requireSession },
    { path: 'forms', component: Forms, onEnter: requireSession },
    { path: 'payments/add', component: PaymentAdd, onEnter: requireSession },
    { path: 'payments/:id/edit', component: PaymentEdit, onEnter: requireSession },
    { path: 'payments', component: Payments, onEnter: requireSession },
    { path: 'libraries/add', component: LibraryAdd, onEnter: requireSession },
    { path: 'libraries/:id', component: Library },
    { path: 'libraries/:id/edit', component: LibraryEdit, onEnter: requireSession },
    { path: 'libraries', component: Libraries, onEnter: requireSession },
    { path: 'messages/add', component: MessageAdd, onEnter: requireSession },
    { path: 'messages/:id', component: Message },
    { path: 'messages/:id/edit', component: MessageEdit, onEnter: requireSession },
    { path: 'messages', component: Messages, onEnter: requireSession },
    { path: 'search', component: Search },
    { path: 'form-templates/add', component: FormTemplateAdd, onEnter: requireSession },
    { path: 'form-templates/:id', component: FormTemplate, onEnter: requireSession },
    { path: 'form-templates/:id/edit', component: FormTemplateEdit, onEnter: requireSession },
    { path: 'form-templates', component: FormTemplates, onEnter: requireSession },
    { path: 'email-lists/add', component: EmailListAdd, onEnter: requireSession },
    { path: 'email-lists/:id', component: EmailList, onEnter: requireSession },
    { path: 'email-lists/:id/edit', component: EmailListEdit, onEnter: requireSession },
    { path: 'email-lists/:name/subscribe', component: EmailListSubscribe },
    { path: 'email-lists/:name/unsubscribe', component: EmailListUnsubscribe },
    { path: 'email-lists', component: EmailLists },
    { path: 'newsletters/add', component: NewsletterAdd, onEnter: requireSession },
    { path: 'newsletters/:id', component: Newsletter, onEnter: requireSession },
    { path: 'newsletters/:id/edit', component: NewsletterEdit, onEnter: requireSession },
    { path: 'newsletters', component: Newsletters, onEnter: requireSession },
    { path: 'domains/add', component: DomainAdd, onEnter: requireSession },
    { path: 'domains/:id', component: Domain, onEnter: requireSession },
    { path: 'domains/:id/edit', component: DomainEdit, onEnter: requireSession },
    { path: 'domains', component: Domains, onEnter: requireSession },
    { path: 'resources/add', component: ResourceAdd, onEnter: requireSession },
    { path: 'resources/:id', component: Resource, onEnter: requireSession },
    { path: 'resources/:id/edit', component: ResourceEdit, onEnter: requireSession },
    { path: 'resources', component: Resources, onEnter: requireSession },
    { path: 'files', component: Files, onEnter: requireSession },
    { path: 'site', component: SiteEdit, onEnter: requireSession },
    { path: ':id', component: Page },
  ],
};
