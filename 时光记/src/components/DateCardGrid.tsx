import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useStore } from '@/store';
import DateCard from './DateCard';
import EmptyState from './EmptyState';
import { cn } from '@/lib/utils';

export default function DateCardGrid() {
  const { getFilteredDates, reorderDates, settings, batchMode, selectedIds } = useStore();
  const filteredDates = getFilteredDates();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderDates(String(active.id), String(over.id));
    }
  };

  if (filteredDates.length === 0) {
    return <EmptyState />;
  }

  const isGrid = settings.viewMode === 'grid';
  const isList = settings.viewMode === 'list';
  const sizeClass = {
    small: isGrid ? 'sm:grid-cols-3 lg:grid-cols-4' : '',
    medium: isGrid ? 'sm:grid-cols-2 lg:grid-cols-3' : '',
    large: isGrid ? 'sm:grid-cols-1 lg:grid-cols-2' : '',
  }[settings.cardSize] || (isGrid ? 'sm:grid-cols-2 lg:grid-cols-3' : '');

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={filteredDates.map((d) => d.id)} strategy={rectSortingStrategy}>
        <div className={cn(
          'grid gap-3',
          isGrid ? `grid-cols-1 ${sizeClass}` : 'grid-cols-1'
        )}>
          {filteredDates.map((item) => (
            <DateCard key={item.id} item={item} batchMode={batchMode} isSelected={selectedIds.includes(item.id)} searchQuery={settings.searchQuery} isList={isList} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
