import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import DesktopPet from '../DesktopPet';
import Navbar from './Navbar';

export default function AppLayout() {
  const [isPetVisible, setIsPetVisible] = useState(() => localStorage.getItem('petVisible') !== 'false');

  useEffect(() => {
    const handleTogglePet = () => {
      setIsPetVisible(current => {
        const next = !current;
        localStorage.setItem('petVisible', String(next));
        return next;
      });
    };

    window.addEventListener('toggle-pet', handleTogglePet);
    return () => window.removeEventListener('toggle-pet', handleTogglePet);
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa] flex overflow-x-hidden antialiased relative">
      <div className="fixed top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-100/40 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-100/30 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[7000ms]" />
      <div className="fixed top-[30%] right-[-5%] w-[25%] h-[25%] bg-amber-100/20 rounded-full blur-[100px] pointer-events-none animate-pulse duration-[5000ms]" />
      <div className="fixed bottom-[20%] left-[-10%] w-[30%] h-[30%] bg-emerald-100/10 rounded-full blur-[110px] pointer-events-none" />

      <Navbar />
      <main className="flex-1 ml-[240px] p-6 md:p-10 transition-all">
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4" />
        </header>
        <Outlet />
      </main>
      {isPetVisible && <DesktopPet />}
    </div>
  );
}
