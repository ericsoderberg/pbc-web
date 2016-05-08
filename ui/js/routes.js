import App from './components/App';
import Home from './pages/home/Home';
import Calendar from './pages/calendar/Calendar';
import Events from './pages/event/Events';
import EventAdd from './pages/event/EventAdd';
import Event from './pages/event/Event';
import EventEdit from './pages/event/EventEdit';
import Forms from './pages/form/Forms';
import FormTemplates from './pages/formTemplate/FormTemplates';
import Messages from './pages/message/Messages';
import MessageAdd from './pages/message/MessageAdd';
import Message from './pages/message/Message';
import MessageEdit from './pages/message/MessageEdit';
import Newsletters from './pages/newsletter/Newsletters';
import Pages from './pages/page/Pages';
import PageAdd from './pages/page/PageAdd';
import Page from './pages/page/Page';
import PageEdit from './pages/page/PageEdit';
import Resources from './pages/resource/Resources';
import ResourceAdd from './pages/resource/ResourceAdd';
import Resource from './pages/resource/Resource';
import ResourceEdit from './pages/resource/ResourceEdit';
import SignIn from './pages/session/SignIn';
import SignUp from './pages/user/SignUp';
import Users from './pages/user/Users';
import UserAdd from './pages/user/UserAdd';
import User from './pages/user/User';
import UserEdit from './pages/user/UserEdit';
import SiteEdit from './pages/site/SiteEdit';

export default {
  path: '/',
  component: App,
  indexRoute: { component: Home },
  childRoutes: [
    { path: 'calendar', component: Calendar },
    { path: 'sign-up', component: SignUp },
    { path: 'sign-in', component: SignIn },
    { path: 'users/add', component: UserAdd },
    { path: 'users/:id', component: User },
    { path: 'users/:id/edit', component: UserEdit },
    { path: 'users', component: Users },
    { path: 'site', component: SiteEdit },
    { path: 'pages/add', component: PageAdd },
    { path: 'pages/:id', component: Page },
    { path: 'pages/:id/edit', component: PageEdit },
    { path: 'pages', component: Pages },
    { path: 'events/add', component: EventAdd },
    { path: 'events/:id', component: Event },
    { path: 'events/:id/edit', component: EventEdit },
    { path: 'events', component: Events },
    { path: 'resources/add', component: ResourceAdd },
    { path: 'resources/:id', component: Resource },
    { path: 'resources/:id/edit', component: ResourceEdit },
    { path: 'resources', component: Resources },
    { path: 'forms', component: Forms },
    { path: 'form-templates', component: FormTemplates },
    { path: 'messages/add', component: MessageAdd },
    { path: 'messages/:id', component: Message },
    { path: 'messages/:id/edit', component: MessageEdit },
    { path: 'messages', component: Messages },
    { path: 'newsletters', component: Newsletters }
  ]
};
