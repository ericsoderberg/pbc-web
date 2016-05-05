import App from './components/App';
import SignIn from './pages/session/SignIn';
import Users from './pages/user/Users';
import UserAdd from './pages/user/UserAdd';
import User from './pages/user/User';
import UserEdit from './pages/user/UserEdit';

export default {
  path: '/',
  component: App,
  childRoutes: [
    { path: 'sign-in', component: SignIn },
    { path: 'users/add', component: UserAdd },
    { path: 'users/:id', component: User },
    { path: 'users/:id/edit', component: UserEdit },
    { path: 'users', component: Users }
  ]
};
