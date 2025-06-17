'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { DndContext, useDraggable, useDroppable, DragEndEvent, DragOverEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Step } from '../shared/types';
import { RELATIONSHIP_CATEGORIES, RELATIONSHIP_STATUS_LABELS, COLUMN_IDS } from '../shared/constants';
import { contactsApi } from '../../services/contactsApi';
import { Contact } from '../../types/contact';

// --- Types ---
interface SortingStepProps {
  onNavigate: (step: Step) => void;
}

// --- Core UI Components (Cards, Columns) ---

const RelationshipCard: React.FC<{ contact: Contact }> = ({ contact }) => {
    const getBackgroundColor = () => {
        if (contact.urgencyLevel && contact.urgencyLevel >= 4) return '#f5c24c';
        if (contact.urgencyLevel && contact.urgencyLevel >= 2) return '#84a98c';
        return '#ffffff';
    };

    const getTextColor = () => {
        if (contact.urgencyLevel && contact.urgencyLevel >= 2) return '#ffffff';
        return '#332211';
    };
    
    return (
        <div 
            className="backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 px-4 py-2 transition-all duration-300 relative h-11 flex items-center justify-center whitespace-nowrap"
            style={{ backgroundColor: getBackgroundColor() }}
        >
            <h3 className="text-sm font-bold text-center" style={{ color: getTextColor() }}>
                {contact.name}
            </h3>
        </div>
    );
};

const DraggableRelationshipCard: React.FC<{ contact: Contact }> = ({ contact }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: contact.id,
        data: { contact },
    });
    const style: React.CSSProperties = {
        transform: CSS.Translate.toString(transform),
        visibility: isDragging ? 'hidden' : 'visible',
        cursor: isDragging ? 'grabbing' : 'grab',
    };
    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="hover:scale-105 transition-transform duration-200">
            <RelationshipCard contact={contact} />
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
    contacts: Contact[];
    isDropTarget?: boolean;
    overId: string | null;
    rounding: 'left' | 'right' | 'full' | 'none';
}> = ({ id, title, contacts, isDropTarget = false, overId, rounding }) => {
    const { setNodeRef } = useDroppable({ id });
    const categoryData = RELATIONSHIP_CATEGORIES[id as keyof typeof RELATIONSHIP_CATEGORIES];
    const labels = RELATIONSHIP_STATUS_LABELS[id as keyof typeof RELATIONSHIP_STATUS_LABELS];

    const showLanes = isDropTarget && labels && overId && String(overId).startsWith(id);
    
    const highUrgencyCards = contacts.filter(c => c.urgencyLevel && c.urgencyLevel >= 4);
    const lowUrgencyCards = contacts.filter(c => !c.urgencyLevel || c.urgencyLevel < 4);

    const getRoundingClasses = (side: 'left' | 'right' | 'full' | 'none') => {
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
                {contacts.length === 0 ? (
                     <div className="h-full min-h-[320px] w-full rounded-lg" />
                ) : isUncategorized ? (
                    <div className="h-full overflow-y-auto p-2">
                        <div className="flex flex-wrap gap-2 items-start">
                            {contacts.map(contact => (
                                <DraggableRelationshipCard key={contact.id} contact={contact} />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="h-full grid grid-rows-2">
                        <div className="p-2 overflow-y-auto">
                            <div className="flex flex-wrap gap-2 items-start">
                                {highUrgencyCards.map(contact => <DraggableRelationshipCard key={contact.id} contact={contact} />)}
                            </div>
                        </div>
                        <div className="p-2 overflow-y-auto">
                            <div className="flex flex-wrap gap-2 items-start">
                                {lowUrgencyCards.map(contact => <DraggableRelationshipCard key={contact.id} contact={contact} />)}
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

const SortingStep: React.FC<SortingStepProps> = ({ onNavigate }) => {
  const [overId, setOverId] = useState<string | null>(null);
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch unsorted contacts from API
  const fetchUnsortedContacts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const allContacts = await contactsApi.getAllContacts();
      // Filter to only contacts without relationshipType
      const unsorted = allContacts.filter((contact: Contact) => !contact.relationshipType);
      setContacts(unsorted);
    } catch (err) {
      console.error('Failed to fetch unsorted contacts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnsortedContacts();
  }, [fetchUnsortedContacts]);

  // Check if sorting is complete (all contacts have been categorized)
  const isSortingComplete = contacts.length === 0;

  const handleDragStart = (event: DragStartEvent) => {
    const contact = event.active.data.current?.contact;
    if (contact) {
      setActiveContact(contact);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    setOverId(event.over?.id as string | null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setOverId(null);
    setActiveContact(null);

    const { active, over } = event;
    if (!over) return;

    const activeContact = active.data.current?.contact as Contact;
    if (!activeContact) return;

    const parts = String(over.id).split('-');
    const targetColumnId = parts.length > 1 ? parts[0] : String(over.id);
    const targetStatus = parts.length > 1 ? parts[1] : null;
    if (targetColumnId === COLUMN_IDS.UNCATEGORIZED) return;

    try {
      // Update the contact in the database
      const urgencyLevel = targetStatus === 'improve' ? 5 : 3; // High urgency for improve, medium for satisfied
      
      await contactsApi.updateContact(Number(activeContact.id), {
        relationshipType: targetColumnId as 'family' | 'friend' | 'work',
        urgencyLevel: urgencyLevel
      });

      // Remove from local state
      setContacts(prev => prev.filter(contact => contact.id !== activeContact.id));
    } catch (err) {
      console.error('Failed to update contact:', err);
      setError('Failed to update contact. Please try again.');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 text-lg mb-4">Loading contacts to sort...</div>
          <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Contacts</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={fetchUnsortedContacts} 
            className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
          <button 
            onClick={() => onNavigate('dashboard')} 
            className="ml-4 px-6 py-3 bg-gray-600 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Empty state - all contacts sorted
  if (isSortingComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">All Contacts Sorted!</h2>
          <p className="text-gray-600 mb-6">Great job! All your contacts have been categorized.</p>
          <button 
            onClick={() => onNavigate('dashboard')} 
            className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragOver={handleDragOver} onDragCancel={() => { setOverId(null); setActiveContact(null); }}>
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #fffcf2 0%, #f9f9f9 100%)' }}>
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header with Back Button */}
                <div className="flex items-center justify-between mb-8">
                    <button 
                        onClick={() => onNavigate('dashboard')} 
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Dashboard
                    </button>
                </div>

                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-2" style={{ background: 'linear-gradient(135deg, #6b4ba3 0%, #563d92 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Organize Your Relationships
                    </h1>
                    <p className="text-gray-600 text-lg mt-4">
                        Drag each person to the category that best describes your relationship
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                        {contacts.length} contact{contacts.length !== 1 ? 's' : ''} remaining to sort
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-6 items-start">
                    <div className="w-full lg:w-1/4">
                        <DroppableColumn 
                            id={COLUMN_IDS.UNCATEGORIZED} 
                            title="Drag to categorize" 
                            contacts={contacts} 
                            overId={overId} 
                            rounding="full" 
                        />
                    </div>

                    <div className="w-full lg:flex-1 grid grid-cols-1 md:grid-cols-3">
                        <DroppableColumn id={COLUMN_IDS.FAMILY} title="Family" contacts={[]} isDropTarget={true} overId={overId} rounding="left" />
                        <DroppableColumn id={COLUMN_IDS.FRIEND} title="Friend" contacts={[]} isDropTarget={true} overId={overId} rounding="none" />
                        <DroppableColumn id={COLUMN_IDS.WORK} title="Work" contacts={[]} isDropTarget={true} overId={overId} rounding="right" />
                    </div>
                </div>
            </div>
        </div>

        <DragOverlay>
            {activeContact ? <RelationshipCard contact={activeContact} /> : null}
        </DragOverlay>
    </DndContext>
  );
};

export default SortingStep;