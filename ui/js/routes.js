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
import Users from './pages/user/Users';
import UserAdd from './pages/user/UserAdd';
import User from './pages/user/User';
import UserEdit from './pages/user/UserEdit';
import UserVerifyEmail from './pages/user/VerifyEmail';
import SiteEdit from './pages/site/SiteEdit';

export default {
  path: '/',
  component: App,
  indexRoute: { component: Home },
  childRoutes: [
    { path: 'calendars/add', component: CalendarAdd },
    { path: 'calendars/:id', component: Calendar },
    { path: 'calendars/:id/edit', component: CalendarEdit },
    { path: 'calendars', component: Calendars },
    { path: 'calendar', component: Calendar },
    { path: 'sign-up', component: SignUp },
    { path: 'sign-in', component: SignIn },
    { path: 'verify-email', component: UserVerifyEmail },
    { path: 'users/add', component: UserAdd },
    { path: 'users/:id', component: User },
    { path: 'users/:id/edit', component: UserEdit },
    { path: 'users', component: Users },
    { path: 'site', component: SiteEdit },
    { path: 'pages/add', component: PageAdd },
    { path: 'pages/:id', component: Page },
    { path: 'pages/:id/edit', component: PageEdit },
    { path: 'pages/:id/map', component: PageMap },
    { path: 'pages', component: Pages },
    { path: 'email-lists/add', component: EmailListAdd },
    { path: 'email-lists/:id', component: EmailList },
    { path: 'email-lists/:id/edit', component: EmailListEdit },
    { path: 'email-lists/:id/subscribe', component: EmailListSubscribe },
    { path: 'email-lists', component: EmailLists },
    { path: 'events/add', component: EventAdd },
    { path: 'events/:id', component: Event },
    { path: 'events/:id/edit', component: EventEdit },
    { path: 'events', component: Events },
    { path: 'resources/add', component: ResourceAdd },
    { path: 'resources/:id', component: Resource },
    { path: 'resources/:id/edit', component: ResourceEdit },
    { path: 'resources', component: Resources },
    { path: 'forms/add', component: FormAdd },
    { path: 'forms/:id/edit', component: FormEdit },
    { path: 'forms', component: Forms },
    { path: 'form-templates/add', component:  FormTemplateAdd },
    { path: 'form-templates/:id', component:  FormTemplate },
    { path: 'form-templates/:id/edit', component:  FormTemplateEdit },
    { path: 'form-templates', component: FormTemplates },
    { path: 'payments/add', component: PaymentAdd },
    { path: 'payments/:id/edit', component: PaymentEdit },
    { path: 'payments', component: Payments },
    { path: 'libraries/add', component: LibraryAdd },
    { path: 'libraries/:id', component: Library },
    { path: 'libraries/:id/edit', component: LibraryEdit },
    { path: 'libraries', component: Libraries },
    { path: 'messages/add', component: MessageAdd },
    { path: 'messages/:id', component: Message },
    { path: 'messages/:id/edit', component: MessageEdit },
    { path: 'messages', component: Messages },
    { path: 'newsletters/add', component: NewsletterAdd },
    { path: 'newsletters/:id', component: Newsletter },
    { path: 'newsletters/:id/edit', component: NewsletterEdit },
    { path: 'newsletters', component: Newsletters },
    { path: 'domains/add', component: DomainAdd },
    { path: 'domains/:id', component: Domain },
    { path: 'domains/:id/edit', component: DomainEdit },
    { path: 'domains', component: Domains },
    { path: 'files', component: Files },
    { path: 'search', component: Search },
    { path: ':id', component: Page }
  ]
};
