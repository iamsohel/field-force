import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

function MainLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden w-full relative" style={{ zIndex: 0 }}>
        <Header />
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 relative" style={{ zIndex: 0 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
