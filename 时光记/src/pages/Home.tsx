import { useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useStore } from '@/store';
import { useTheme } from '@/hooks/useTheme';
import { useNotification } from '@/hooks/useNotification';
import Navbar from '@/components/Navbar';
import CategoryFilter from '@/components/CategoryFilter';
import DateCardGrid from '@/components/DateCardGrid';
import CalendarView from '@/components/CalendarView';
import SearchBar from '@/components/SearchBar';
import AddEditModal from '@/components/AddEditModal';
import SettingsDrawer from '@/components/SettingsDrawer';
import StatisticsPanel from '@/components/StatisticsPanel';
import BatchActionBar from '@/components/BatchActionBar';
import Toast from '@/components/Toast';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function Home() {
  const { init, setShowAddModal, settings, batchMode } = useStore();
  useTheme();
  useNotification();

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark transition-colors duration-300">
      <Navbar />

      <main className="container max-w-5xl mx-auto px-4 py-4">
        <SearchBar />
        <div className="mt-3">
          <CategoryFilter />
        </div>
        <div className="mt-4">
          {settings.viewMode === 'calendar' ? (
            <CalendarView />
          ) : (
            <DateCardGrid />
          )}
        </div>
      </main>

      {/* Floating Add Button - hidden in batch mode */}
      {!batchMode && (
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed right-5 bottom-6 w-14 h-14 rounded-full bg-morandi-coral hover:bg-morandi-coral-dark text-white shadow-fab hover:shadow-fab-hover transition-all active:scale-95 z-20 flex items-center justify-center group"
        title="添加日期"
      >
        <Plus className="w-6 h-6 transition-transform group-hover:rotate-45" />
      </button>
      )}

      {/* Batch Action Bar */}
      <BatchActionBar />

      {/* Modals & Overlays */}
      <AddEditModal />
      <SettingsDrawer />
      <StatisticsPanel />
      <Toast />
      <ConfirmDialog />
    </div>
  );
}
