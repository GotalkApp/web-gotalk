import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { ChatPage } from './pages/ChatPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { SecurityPage } from './pages/SecurityPage';
import { LoginPage } from './pages/LoginPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: LoginPage
  },
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: ChatPage },
      { path: 'profile', Component: ProfilePage },
      { path: 'settings', Component: SettingsPage },
      { path: 'settings/privacy', Component: PrivacyPage },
      { path: 'settings/security', Component: SecurityPage }
    ]
  }
]);