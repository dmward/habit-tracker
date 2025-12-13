import { Outlet } from 'react-router-dom';
import Header from './Header';
import Navigation from './Navigation';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <Navigation />
      <main className="py-8 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
