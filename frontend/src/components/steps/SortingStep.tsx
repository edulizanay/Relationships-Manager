'use client';
import React, { useState } from 'react';
import { DndContext, useDraggable, useDroppable, DragEndEvent, DragOverEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Relationship, RelationshipColumns, RoundingSide } from '../shared/types';
import { RELATIONSHIP_CATEGORIES, RELATIONSHIP_STATUS_LABELS, COLUMN_IDS } from '../shared/constants';

// --- Core UI Components (Cards, Columns) ---

const RelationshipCard: React.FC<{ relationship: Relationship }> = ({ relationship }) => {
    const getBackgroundColor = () => {
        if (relationship.relationshipStatus === 'improve') return '#f5c24c';
        if (relationship.relationshipStatus === 'satisfied') return '#84a98c';
        return '#ffffff';
    };

    const getTextColor = () => {
        if (relationship.relationshipStatus) return '#ffffff';
        return '#332211';
    };
    
    return (
        <div 
            className="backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 px-4 py-2 transition-all duration-300 relative h-11 flex items-center justify-center whitespace-nowrap"
            style={{ backgroundColor: getBackgroundColor() }}
        >
            <h3 className="text-sm font-bold text-center" style={{ color: getTextColor() }}>
                {relationship.name}
            </h3>
        </div>
    );
};

const DraggableRelationshipCard: React.FC<{ relationship: Relationship }> = ({ relationship }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: relationship.id,
        data: { relationship },
    });
    const style: React.CSSProperties = {
        transform: CSS.Translate.toString(transform),
        visibility: isDragging ? 'hidden' : 'visible',
        cursor: isDragging ? 'grabbing' : 'grab',
    };
    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="hover:scale-105 transition-transform duration-200">
            <RelationshipCard relationship={relationship} />
        </div>
    );
};

const LaneDropZone: React.FC<{ id: string, label: string, color: string }> = ({ id, label, color }) => {
    const { setNodeRef, isOver } = useDroppable({ id });
    return (
        <div ref={setNodeRef} className="flex-grow w-full flex items-center justify-center border-2 border-dashed rounded-lg transition-all duration-200" style={{ borderColor: isOver ? (id.includes('improve') ? '#f5c24c' : '#84a98c') : 'transparent', backgroundColor: isOver ? color : 'transparent' }}>
            <p className="font-semibold text-lg" style={{color: id.includes('improve') ? '#c4973c' : '#5a7e63'}}>{label}</p>
        </div>
    );
};

const DroppableColumn: React.FC<{
    id: string;
    title: string;
    relationships: Relationship[];
    isDropTarget?: boolean;
    overId: string | null;
    rounding: RoundingSide;
}> = ({ id, title, relationships, isDropTarget = false, overId, rounding }) => {
    const { setNodeRef } = useDroppable({ id });
    const categoryData = RELATIONSHIP_CATEGORIES[id as keyof typeof RELATIONSHIP_CATEGORIES];
    const labels = RELATIONSHIP_STATUS_LABELS[id as keyof typeof RELATIONSHIP_STATUS_LABELS];

    const showLanes = isDropTarget && labels && overId && String(overId).startsWith(id);
    
    const improveCards = relationships.filter(r => r.relationshipStatus === 'improve');
    const satisfiedCards = relationships.filter(r => r.relationshipStatus !== 'improve');

    const getRoundingClasses = (side: RoundingSide) => {
        switch(side) {
            case 'left': return 'rounded-l-2xl';
            case 'right': return 'rounded-r-2xl';
            case 'full': return 'rounded-2xl';
            case 'none': return '';
            default: return '';
        }
    }

    const isUncategorized = id === COLUMN_IDS.UNCATEGORIZED;

    return (
        <div className={`flex-1 min-h-[400px] flex flex-col bg-gray-50/50 p-4 transition-colors duration-300 ${getRoundingClasses(rounding)} ${!isUncategorized ? 'border-2 border-[#6b4ba3]' : ''}`} style={{ backgroundColor: categoryData?.bgColor }}>
            <h2 className="text-xl font-bold text-center mb-4 h-7" style={{color: '#563d92'}}>{title}</h2>
            
            <div ref={setNodeRef} className="flex-grow flex flex-col relative">
                {relationships.length === 0 ? (
                     <div className="h-full min-h-[320px] w-full rounded-lg" />
                ) : isUncategorized ? (
                    <div className="h-full overflow-y-auto p-2">
                        <div className="flex flex-wrap gap-2 items-start">
                            {relationships.map(rel => (
                                <DraggableRelationshipCard key={rel.id} relationship={rel} />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="h-full grid grid-rows-2">
                        <div className="p-2 overflow-y-auto">
                            <div className="flex flex-wrap gap-2 items-start">
                                {improveCards.map(rel => <DraggableRelationshipCard key={rel.id} relationship={rel} />)}
                            </div>
                        </div>
                        <div className="p-2 overflow-y-auto">
                            <div className="flex flex-wrap gap-2 items-start">
                                {satisfiedCards.map(rel => <DraggableRelationshipCard key={rel.id} relationship={rel} />)}
                            </div>
                        </div>
                    </div>
                )}

                <div className={`absolute inset-0 z-20 flex flex-col gap-3 p-1 transition-opacity duration-200 bg-white/30 backdrop-blur-sm ${getRoundingClasses(rounding)} ${showLanes ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                    {showLanes && (
                        <>
                            <LaneDropZone id={`${id}-improve`} label={labels?.[1].label || ''} color={categoryData?.laneColors.improve || ''} />
                            <LaneDropZone id={`${id}-satisfied`} label={labels?.[0].label || ''} color={categoryData?.laneColors.satisfied || ''} />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Main Sorting Interface ---

interface SortingStepProps {
  relationshipsByColumn: RelationshipColumns;
  setRelationshipsByColumn: React.Dispatch<React.SetStateAction<RelationshipColumns>>;
}

const SortingStep: React.FC<SortingStepProps> = ({ relationshipsByColumn, setRelationshipsByColumn }) => {
  const [isCompleting, setIsCompleting] = React.useState(false);
  const [overId, setOverId] = useState<string | null>(null);
  const [activeRelationship, setActiveRelationship] = useState<Relationship | null>(null);

  React.useEffect(() => {
    if (relationshipsByColumn[COLUMN_IDS.UNCATEGORIZED].length === 0 && !isCompleting) {
      setIsCompleting(true);
      setTimeout(() => {
        // onNext();
      }, 500);
    }
  }, [relationshipsByColumn, isCompleting]);

  const handleDragStart = (event: DragStartEvent) => {
    const relationship = event.active.data.current?.relationship;
    if (relationship) {
      setActiveRelationship(relationship);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    setOverId(event.over?.id as string | null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setOverId(null);
    setActiveRelationship(null);

    const { active, over } = event;
    if (!over) return;

    const activeCard = active.data.current?.relationship as Relationship;
    if (!activeCard) return;

    const sourceColumnId = Object.keys(relationshipsByColumn).find(key => relationshipsByColumn[key].some(rel => rel.id === activeCard.id));
    if (!sourceColumnId) return;

    let [targetColumnId, targetStatus] = String(over.id).split('-');
    if (!targetStatus) { targetColumnId = String(over.id); }
    if (targetColumnId === COLUMN_IDS.UNCATEGORIZED) return;

    setRelationshipsByColumn(prev => {
        const newColumns = { ...prev };
        newColumns[sourceColumnId] = newColumns[sourceColumnId].filter(rel => rel.id !== activeCard.id);
        const updatedCard = {
            ...activeCard,
            category: targetColumnId,
            relationshipStatus: (targetStatus as 'improve' | 'satisfied' | null) || activeCard.relationshipStatus,
        };
        if (!newColumns[targetColumnId]) { newColumns[targetColumnId] = []; }
        newColumns[targetColumnId] = [...newColumns[targetColumnId], updatedCard];
        return newColumns;
    });
  };

  const handleSubmit = () => {
    // Any validation or processing logic here
    // onNext();
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragOver={handleDragOver} onDragCancel={() => { setOverId(null); setActiveRelationship(null); }}>
        <div className={`min-h-screen transition-opacity duration-500 ${isCompleting ? 'opacity-0' : 'opacity-100'}`} style={{ background: 'linear-gradient(135deg, #fffcf2 0%, #f9f9f9 100%)' }}>
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-2" style={{ background: 'linear-gradient(135deg, #6b4ba3 0%, #563d92 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Map Your Relationships
                    </h1>
                    {isCompleting && (
                        <p className="text-gray-600 text-lg mt-4">Completing mapping...</p>
                    )}
                </div>

                <div className="flex flex-col lg:flex-row gap-6 items-start">
                    <div className="w-full lg:w-1/4">
                        <DroppableColumn id={COLUMN_IDS.UNCATEGORIZED} title="" relationships={relationshipsByColumn[COLUMN_IDS.UNCATEGORIZED]} overId={overId} rounding="full" />
                    </div>

                    <div className="w-full lg:flex-1 grid grid-cols-1 md:grid-cols-3">
                        <DroppableColumn id={COLUMN_IDS.FAMILY} title="Family" relationships={relationshipsByColumn[COLUMN_IDS.FAMILY]} isDropTarget={true} overId={overId} rounding="left" />
                        <DroppableColumn id={COLUMN_IDS.FRIEND} title="Friend" relationships={relationshipsByColumn[COLUMN_IDS.FRIEND]} isDropTarget={true} overId={overId} rounding="none" />
                        <DroppableColumn id={COLUMN_IDS.WORK} title="Work" relationships={relationshipsByColumn[COLUMN_IDS.WORK]} isDropTarget={true} overId={overId} rounding="right" />
                    </div>
                </div>
            </div>
        </div>

        <DragOverlay>
            {activeRelationship ? <RelationshipCard relationship={activeRelationship} /> : null}
        </DragOverlay>
    </DndContext>
  );
};

export default SortingStep; 