import App from './components/App';
import Home from './pages/home/Home';
import Events from './pages/event/Events';
import Forms from './pages/form/Forms';
import FormTemplates from './pages/formTemplate/FormTemplates';
import Messages from './pages/message/Messages';
import Newsletters from './pages/newsletter/Newsletters';
import Pages from './pages/page/Pages';
import PageAdd from './pages/page/PageAdd';
import Page from './pages/page/Page';
import PageEdit from './pages/page/PageEdit';
import Resources from './pages/resource/Resources';
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
    { path: 'events', component: Events },
    { path: 'resources', component: Resources },
    { path: 'forms', component: Forms },
    { path: 'form-templates', component: FormTemplates },
    { path: 'messages', component: Messages },
    { path: 'newsletters', component: Newsletters }
  ]
};
