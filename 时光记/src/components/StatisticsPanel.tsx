import { useMemo } from 'react';
import { X, BarChart3, Calendar, Heart, Clock, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { useStore } from '@/store';
import { CATEGORIES } from '@/types';
import { getDaysDiff, getYearAnniversary, formatDisplayDate } from '@/utils/dateCalc';
import { cn } from '@/lib/utils';

export default function StatisticsPanel() {
  const { showStatistics, setShowStatistics, dates, settings } = useStore();

  const stats = useMemo(() => {
    const countdowns = dates.filter((d) => d.type === 'countdown');
    const anniversaries = dates.filter((d) => d.type === 'anniversary');

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const thisMonthExpiring = countdowns.filter((d) => {
      const target = new Date(d.date);
      const diff = getDaysDiff(d.date);
      return diff >= 0 && target.getMonth() === currentMonth && target.getFullYear() === currentYear;
    }).length;

    // Category distribution (include custom categories)
    const allCats = [...CATEGORIES.filter((c) => c.id !== 'all' && c.id !== 'custom'), ...settings.customCategories];
    const categoryData = allCats
      .map((cat) => {
        const count = dates.filter((d) => d.category === cat.id).length;
        return { name: cat.label, value: count, color: cat.color };
      })
      .filter((d) => d.value > 0);

    // Anniversary years
    const anniversaryStats = anniversaries
      .map((d) => ({
        id: d.id,
        title: d.title,
        date: d.date,
        years: getYearAnniversary(d.date),
      }))
      .sort((a, b) => b.years - a.years);

    // Upcoming countdowns (within 7 days)
    const upcoming = countdowns
      .filter((d) => {
        const diff = getDaysDiff(d.date);
        return diff >= 0 && diff <= 7;
      })
      .map((d) => ({
        id: d.id,
        title: d.title,
        date: d.date,
        daysLeft: getDaysDiff(d.date),
      }))
      .sort((a, b) => a.daysLeft - b.daysLeft);

    return {
      total: dates.length,
      countdownCount: countdowns.length,
      anniversaryCount: anniversaries.length,
      thisMonthExpiring,
      categoryData,
      anniversaryStats,
      upcoming,
    };
  }, [dates, settings.customCategories]);

  if (!showStatistics) return null;

  return (
    <div className="fixed inset-0 z-50" onClick={() => setShowStatistics(false)}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 dark:bg-black/40 animate-fade-in" />

      {/* Panel */}
      <div
        className="absolute right-0 top-0 bottom-0 w-[320px] max-w-[85vw] bg-white dark:bg-surface-card-dark shadow-modal animate-slide-right overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-morandi-coral" />
            <h2 className="font-display font-bold text-lg text-text-primary dark:text-text-primary-dark">
              统计分析
            </h2>
          </div>
          <button
            onClick={() => setShowStatistics(false)}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5 text-text-secondary dark:text-text-secondary-dark" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Overview Cards */}
          <section>
            <h3 className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-3 font-body">
              总体概览
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-2xl p-3.5 bg-[#F5F0EB] dark:bg-[#252540]">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Calendar className="w-3.5 h-3.5 text-text-secondary dark:text-text-secondary-dark" />
                  <span className="text-xs text-text-secondary dark:text-text-secondary-dark font-body">总日期数</span>
                </div>
                <span className="text-2xl font-bold text-text-primary dark:text-text-primary-dark font-display">
                  {stats.total}
                </span>
              </div>
              <div className="rounded-2xl p-3.5 bg-[#F5F0EB] dark:bg-[#252540]">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Clock className="w-3.5 h-3.5 text-morandi-blue" />
                  <span className="text-xs text-text-secondary dark:text-text-secondary-dark font-body">倒数日</span>
                </div>
                <span className="text-2xl font-bold text-text-primary dark:text-text-primary-dark font-display">
                  {stats.countdownCount}
                </span>
              </div>
              <div className="rounded-2xl p-3.5 bg-[#F5F0EB] dark:bg-[#252540]">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Heart className="w-3.5 h-3.5 text-morandi-pink" />
                  <span className="text-xs text-text-secondary dark:text-text-secondary-dark font-body">纪念日</span>
                </div>
                <span className="text-2xl font-bold text-text-primary dark:text-text-primary-dark font-display">
                  {stats.anniversaryCount}
                </span>
              </div>
              <div className="rounded-2xl p-3.5 bg-[#F5F0EB] dark:bg-[#252540]">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-morandi-coral" />
                  <span className="text-xs text-text-secondary dark:text-text-secondary-dark font-body">本月到期</span>
                </div>
                <span className="text-2xl font-bold text-text-primary dark:text-text-primary-dark font-display">
                  {stats.thisMonthExpiring}
                </span>
              </div>
            </div>
          </section>

          {/* Category Distribution Chart */}
          <section>
            <h3 className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-3 font-body">
              分类分布
            </h3>
            {stats.categoryData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-text-secondary dark:text-text-secondary-dark">
                <BarChart3 className="w-10 h-10 mb-2 opacity-30" />
                <span className="text-sm font-body">暂无数据</span>
              </div>
            ) : (
              <div className="rounded-2xl p-4 bg-[#F5F0EB] dark:bg-[#252540]">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={stats.categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {stats.categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend
                      verticalAlign="middle"
                      align="right"
                      layout="vertical"
                      iconType="circle"
                      iconSize={8}
                      formatter={(value: string) => (
                        <span className="text-xs text-text-primary dark:text-text-primary-dark font-body">
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center total label */}
                <div className="text-center -mt-4">
                  <span className="text-2xl font-bold text-text-primary dark:text-text-primary-dark font-display">
                    {stats.total}
                  </span>
                  <span className="text-xs text-text-secondary dark:text-text-secondary-dark font-body ml-1">个</span>
                </div>
              </div>
            )}
          </section>

          {/* Anniversary Years */}
          <section>
            <h3 className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-3 font-body">
              纪念日周年
            </h3>
            {stats.anniversaryStats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-text-secondary dark:text-text-secondary-dark">
                <Heart className="w-8 h-8 mb-2 opacity-30" />
                <span className="text-sm font-body">暂无纪念日</span>
              </div>
            ) : (
              <div className="space-y-2">
                {stats.anniversaryStats.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#F5F0EB] dark:bg-[#252540]"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-text-primary dark:text-text-primary-dark font-body truncate">
                        {item.title}
                      </div>
                      <div className="text-xs text-text-secondary dark:text-text-secondary-dark font-body mt-0.5">
                        {formatDisplayDate(item.date)}
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1 ml-3 shrink-0">
                      <span className="text-2xl font-bold text-morandi-coral font-display">
                        {item.years}
                      </span>
                      <span className="text-xs text-text-secondary dark:text-text-secondary-dark font-body">周年</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Upcoming Countdowns */}
          <section>
            <h3 className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-3 font-body">
              即将到期
            </h3>
            {stats.upcoming.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-text-secondary dark:text-text-secondary-dark">
                <Clock className="w-8 h-8 mb-2 opacity-30" />
                <span className="text-sm font-body">7天内暂无到期</span>
              </div>
            ) : (
              <div className="space-y-2">
                {stats.upcoming.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#F5F0EB] dark:bg-[#252540]"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-text-primary dark:text-text-primary-dark font-body truncate">
                        {item.title}
                      </div>
                      <div className="text-xs text-text-secondary dark:text-text-secondary-dark font-body mt-0.5">
                        {formatDisplayDate(item.date)}
                      </div>
                    </div>
                    <div
                      className={cn(
                        'flex items-baseline gap-1 ml-3 shrink-0',
                        item.daysLeft === 0 ? 'text-morandi-coral' : 'text-morandi-blue'
                      )}
                    >
                      <span className="text-2xl font-bold font-display">
                        {item.daysLeft === 0 ? '今天' : item.daysLeft}
                      </span>
                      {item.daysLeft > 0 && (
                        <span className="text-xs text-text-secondary dark:text-text-secondary-dark font-body">天</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
