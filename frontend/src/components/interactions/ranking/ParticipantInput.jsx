import { useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const RankedItem = ({ id, label, disabled }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 rounded-xl border border-[#2A2A2A] bg-[#1F1F1F] px-4 py-3 shadow-sm transition ${disabled ? '' : 'cursor-grab active:cursor-grabbing'}`}
      {...attributes}
      {...listeners}
    >
      <p className="flex-1 text-base font-medium text-[#E0E0E0]">{label}</p>
    </div>
  );
};

const DroppableList = ({ id, items, itemMap, title, placeholder, disabled }) => {
  const { setNodeRef, isOver } = useDroppable({ id, disabled });
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold text-[#B0B0B0] uppercase tracking-wide">{title}</div>
      <div
        ref={setNodeRef}
        className={`min-h-[160px] rounded-2xl border-2 border-dashed ${items.length ? 'border-transparent bg-transparent' : 'border-[#2A2A2A] bg-[#1F1F1F]'} ${isOver ? 'bg-[#1D2A20] border-[#2E7D32]/30' : ''} p-4 transition-colors`}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {items.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-sm text-[#6C6C6C] text-center">
                {placeholder}
              </div>
            ) : (
              items.map((itemId) => (
                <RankedItem key={itemId} id={itemId} label={itemMap.get(itemId)?.label || ''} disabled={disabled} />
              ))
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
};

const RankingParticipantInput = ({ slide, onSubmit, hasSubmitted, initialRanking = [] }) => {
  const { t } = useTranslation();
  const items = useMemo(() => Array.isArray(slide?.rankingItems) ? slide.rankingItems : [], [slide?.rankingItems]);
  const itemMap = useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);

  const [ranked, setRanked] = useState([]);
  const [available, setAvailable] = useState(() => items.map((item) => item.id));
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  useEffect(() => {
    const allIds = items.map((item) => item.id);
    const initialValidRanking = Array.isArray(initialRanking)
      ? initialRanking.filter((id) => itemMap.has(id))
      : [];
    setRanked(initialValidRanking);
    setAvailable(allIds.filter((id) => !initialValidRanking.includes(id)));
  }, [slide?.id, items, itemMap, initialRanking]);

  const findContainer = (id) => {
    if (ranked.includes(id)) return 'ranked';
    if (available.includes(id)) return 'available';
    return null;
  };

  const handleDragEnd = (event) => {
    if (hasSubmitted) return;
    const { active, over } = event;
    if (!over) return;

    const getContainer = (id) => {
      if (id === 'ranked' || id === 'available') return id;
      return findContainer(id);
    };

    const activeContainer = getContainer(active.id);
    let overContainer = getContainer(over.id);

    if (!overContainer && over.data?.current?.sortable) {
      overContainer = over.data.current.sortable.containerId;
    }

    if (!activeContainer || !overContainer) return;

    if (activeContainer === overContainer) {
      const list = activeContainer === 'ranked' ? ranked : available;
      const activeIndex = list.indexOf(active.id);
      let overIndex;
      if (over.id === overContainer) {
        overIndex = list.length - 1;
      } else {
        overIndex = list.indexOf(over.id);
      }
      if (overIndex === -1) overIndex = list.length - 1;
      if (activeIndex !== overIndex) {
        const reordered = arrayMove(list, activeIndex, overIndex);
        if (activeContainer === 'ranked') setRanked(reordered);
        else setAvailable(reordered);
      }
      return;
    }

    if (activeContainer === 'available' && overContainer === 'ranked') {
      setAvailable((prev) => prev.filter((id) => id !== active.id));
      setRanked((prev) => {
        let insertIndex;
        if (over.id === overContainer) {
          insertIndex = prev.length;
        } else {
          insertIndex = prev.indexOf(over.id);
          if (insertIndex === -1) insertIndex = prev.length;
        }
        const next = [...prev];
        next.splice(insertIndex, 0, active.id);
        return next;
      });
    } else if (activeContainer === 'ranked' && overContainer === 'available') {
      setRanked((prev) => prev.filter((id) => id !== active.id));
      setAvailable((prev) => {
        let insertIndex;
        if (over.id === overContainer) {
          insertIndex = prev.length;
        } else {
          insertIndex = prev.indexOf(over.id);
          if (insertIndex === -1) insertIndex = prev.length;
        }
        const next = [...prev];
        next.splice(insertIndex, 0, active.id);
        return next;
      });
    }
  };

  const handleSubmit = async () => {
    if (hasSubmitted) return;
    if (ranked.length === 0) return;
    await onSubmit(ranked);
  };

  if (!slide) return null;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-semibold text-[#E0E0E0]">{slide.question}</h2>
        <p className="mt-2 text-sm text-[#B0B0B0]">{t('slide_editors.ranking.drag_instructions_participant') || 'Drag items into the ranking zone and reorder to show your priorities.'}</p>
      </div>

      {hasSubmitted ? (
        <div className="rounded-3xl border border-[#2E7D32]/30 bg-[#1D2A20] px-8 py-12 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#2E7D32]/20">
            <svg className="h-10 w-10 text-[#4CAF50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-[#E0E0E0]">{t('slide_editors.ranking.submitted_title') || 'Ranking submitted'}</h3>
          <p className="mt-2 text-sm text-[#B0B0B0]">{t('slide_editors.ranking.thanks_message') || 'Thanks for sharing your order.'}</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <DroppableList
                id="ranked"
                items={ranked}
                itemMap={itemMap}
                title={t('slide_editors.ranking.your_ranking') || 'Your ranking'}
                placeholder={t('slide_editors.ranking.drag_to_start') || 'Drag an item here to start ranking.'}
                disabled={hasSubmitted}
              />
            </div>
            <div>
              <DroppableList
                id="available"
                items={available}
                itemMap={itemMap}
                title={t('slide_editors.ranking.available_items') || 'Available items'}
                placeholder={t('slide_editors.ranking.items_waiting') || 'Items waiting to be ranked appear here.'}
                disabled={hasSubmitted}
              />
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={ranked.length === 0}
              className="mt-6 flex items-center gap-2 rounded-full bg-gradient-to-r from-[#388E3C] to-[#2E7D32] hover:from-[#4CAF50] hover:to-[#388E3C] disabled:from-[#1F1F1F] disabled:to-[#1F1F1F] disabled:text-[#6C6C6C] px-6 py-3 text-lg font-semibold text-white transition-all active:scale-95 disabled:active:scale-100 shadow-lg shadow-[#4CAF50]/20 disabled:shadow-none"
            >
              <Send className="h-5 w-5" />
              {t('slide_editors.ranking.submit_ranking') || 'Submit ranking'}
            </button>
          </div>
        </DndContext>
      )}
    </div>
  );
};

export default RankingParticipantInput;