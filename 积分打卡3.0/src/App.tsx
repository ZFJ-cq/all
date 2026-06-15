import { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Profile from '@/pages/Profile';
import Tasks from '@/pages/Tasks';
import History from '@/pages/History';
import Stats from '@/pages/Stats';
import Exchange from '@/pages/Exchange';
import PetFeeding from '@/pages/PetFeeding';
import PetShop from '@/pages/PetShop';
import { useStore } from '@/store';
import { ArrowLeft } from 'lucide-react';

function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FFF9F2] px-8">
      <span className="text-6xl">🔍</span>
      <h2 className="mt-4 text-xl font-bold text-[#1A1B3A]">页面不存在</h2>
      <p className="mt-2 text-sm text-[#9CA3AF]">你访问的页面可能已被移动或删除</p>
      <button
        onClick={() => navigate('/')}
        className="mt-6 flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF8C42] to-[#FF6B6B] px-6 py-3 text-sm font-semibold text-white active:scale-95"
      >
        <ArrowLeft size={16} />
        返回首页
      </button>
    </div>
  );
}

export default function App() {
  const refreshDaily = useStore((s) => s.refreshDaily);

  useEffect(() => {
    refreshDaily();
  }, [refreshDaily]);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/history" element={<History />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/exchange" element={<Exchange />} />
          <Route path="/pet-feeding" element={<PetFeeding />} />
          <Route path="/pet-shop" element={<PetShop />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </Router>
  );
}
