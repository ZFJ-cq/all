import { Clock, Plus } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
      <div className="w-24 h-24 rounded-full bg-morandi-blue/10 dark:bg-morandi-blue/20 flex items-center justify-center mb-6">
        <Clock className="w-10 h-10 text-morandi-blue dark:text-morandi-blue-light" />
      </div>
      <h3 className="font-display font-bold text-xl text-text-primary dark:text-text-primary-dark mb-2">
        还没有日期记录
      </h3>
      <p className="text-text-secondary dark:text-text-secondary-dark text-sm font-body">
        点击右下角
        <Plus className="w-3.5 h-3.5 inline mx-0.5 text-morandi-coral" />
        添加第一个重要日期
      </p>
    </div>
  );
}
