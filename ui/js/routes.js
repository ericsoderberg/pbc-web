import Home from './pages/home/Home';
import AuditLog from './pages/auditLog/AuditLog';
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
import EmailListModerate from './pages/emailList/EmailListModerate';
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
import FormTemplateEmail from './pages/formTemplate/FormTemplateEmail';
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
import ResourcesCalendar from './pages/resource/ResourcesCalendar';
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

export default [
  { path: '/', component: Home, exact: true },

  { path: '/calendars', component: Calendars, exact: true, private: true },
  { path: '/calendars/add', component: CalendarAdd, private: true },
  { path: '/calendars/:id', component: Calendar, exact: true },
  { path: '/calendars/:id/edit', component: CalendarEdit, private: true },
  { path: '/calendar', component: Calendar },

  { path: '/search', component: Search },

  { path: '/sign-up', component: SignUp },
  { path: '/sign-in', component: SignIn },
  { path: '/verify-email', component: VerifyEmail },

  { path: '/users', component: Users, exact: true },
  { path: '/users/add', component: UserAdd },
  { path: '/users/:id', component: User, exact: true },
  { path: '/users/:id/edit', component: UserEdit },

  { path: '/pages', component: Pages, exact: true, private: true },
  { path: '/pages/add', component: PageAdd, private: true },
  { path: '/pages/:id', component: Page, exact: true },
  { path: '/pages/:id/edit', component: PageEdit, private: true },
  { path: '/pages/:id/map', component: PageMap, private: true },

  { path: '/events', component: Events, exact: true, private: true },
  { path: '/events/add', component: EventAdd, private: true },
  { path: '/events/:id', component: Event, exact: true },
  { path: '/events/:id/edit', component: EventEdit, private: true },

  { path: '/forms', component: Forms, exact: true, private: true },
  { path: '/forms/add', component: FormAdd, private: true },
  { path: '/forms/:id/edit', component: FormEdit, private: true },

  { path: '/payments', component: Payments, exact: true, private: true },
  { path: '/payments/add', component: PaymentAdd, private: true },
  { path: '/payments/:id/edit', component: PaymentEdit, private: true },

  { path: '/form-templates', component: FormTemplates, exact: true, private: true },
  { path: '/form-templates/add', component: FormTemplateAdd, private: true },
  { path: '/form-templates/:id', component: FormTemplate, exact: true, private: true },
  { path: '/form-templates/:id/edit', component: FormTemplateEdit, private: true },
  { path: '/form-templates/:id/email', component: FormTemplateEmail, private: true },

  { path: '/libraries', component: Libraries, exact: true, private: true },
  { path: '/libraries/add', component: LibraryAdd, private: true },
  { path: '/libraries/:id', component: Library, exact: true },
  { path: '/libraries/:id/edit', component: LibraryEdit, private: true },

  { path: '/messages', component: Messages, exact: true, private: true },
  { path: '/messages/add', component: MessageAdd, private: true },
  { path: '/messages/:id', component: Message, exact: true },
  { path: '/messages/:id/edit', component: MessageEdit, private: true },

  { path: '/email-lists', component: EmailLists, exact: true, private: true },
  { path: '/email-lists/add', component: EmailListAdd, private: true },
  { path: '/email-lists/:id', component: EmailList, exact: true, private: true },
  { path: '/email-lists/:id/edit', component: EmailListEdit, private: true },
  { path: '/email-lists/:id/moderate', component: EmailListModerate },
  { path: '/email-lists/:name/subscribe', component: EmailListSubscribe },
  { path: '/email-lists/:name/unsubscribe', component: EmailListUnsubscribe },

  { path: '/newsletters', component: Newsletters, exact: true, private: true },
  { path: '/newsletters/add', component: NewsletterAdd, private: true },
  { path: '/newsletters/:id', component: Newsletter, exact: true, private: true },
  { path: '/newsletters/:id/edit', component: NewsletterEdit, private: true },

  { path: '/domains', component: Domains, exact: true, private: true },
  { path: '/domains/add', component: DomainAdd, private: true },
  { path: '/domains/:id', component: Domain, exact: true, private: true },
  { path: '/domains/:id/edit', component: DomainEdit, private: true },

  { path: '/resources', component: Resources, exact: true, private: true },
  { path: '/resources/add', component: ResourceAdd, private: true },
  { path: '/resources/calendar', component: ResourcesCalendar, private: true },
  { path: '/resources/:id', component: Resource, exact: true, private: true },
  { path: '/resources/:id/edit', component: ResourceEdit, private: true },

  { path: '/files', component: Files, private: true },
  { path: '/site', component: SiteEdit, private: true },
  { path: '/audit-log', component: AuditLog, private: true },

  { path: '/:id', component: Page },
];
