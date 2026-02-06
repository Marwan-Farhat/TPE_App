 import React, { useState, useEffect } from "react";
 import { GripVertical } from "lucide-react";
 import { cn } from "@/lib/utils";
 
 const STORAGE_KEY = "proenglish_dashboard_sections_order";
 
 export interface DashboardSection {
   id: string;
   component: React.ReactNode;
 }
 
 interface DraggableSectionsProps {
   sections: DashboardSection[];
 }
 
 const DraggableSections: React.FC<DraggableSectionsProps> = ({ sections }) => {
   const [orderedSections, setOrderedSections] = useState<DashboardSection[]>(sections);
   const [draggedId, setDraggedId] = useState<string | null>(null);
   const [dragOverId, setDragOverId] = useState<string | null>(null);
 
   // Load saved order on mount
   useEffect(() => {
     const storedOrder = localStorage.getItem(STORAGE_KEY);
     if (storedOrder) {
       try {
         const orderIds: string[] = JSON.parse(storedOrder);
         // Reorder sections based on stored order
         const reordered = orderIds
           .map((id) => sections.find((s) => s.id === id))
           .filter(Boolean) as DashboardSection[];
         
         // Add any new sections that weren't in stored order
         const newSections = sections.filter(
           (s) => !orderIds.includes(s.id)
         );
         
         setOrderedSections([...reordered, ...newSections]);
       } catch {
         setOrderedSections(sections);
       }
     } else {
       setOrderedSections(sections);
     }
   }, [sections]);
 
   const saveOrder = (newSections: DashboardSection[]) => {
     const orderIds = newSections.map((s) => s.id);
     localStorage.setItem(STORAGE_KEY, JSON.stringify(orderIds));
   };
 
   const handleDragStart = (e: React.DragEvent, id: string) => {
     setDraggedId(id);
     e.dataTransfer.effectAllowed = "move";
     e.dataTransfer.setData("text/plain", id);
   };
 
   const handleDragEnd = () => {
     setDraggedId(null);
     setDragOverId(null);
   };
 
   const handleDragOver = (e: React.DragEvent, id: string) => {
     e.preventDefault();
     if (draggedId !== id) {
       setDragOverId(id);
     }
   };
 
   const handleDragLeave = () => {
     setDragOverId(null);
   };
 
   const handleDrop = (e: React.DragEvent, dropId: string) => {
     e.preventDefault();
     if (!draggedId || draggedId === dropId) return;
 
     const draggedIndex = orderedSections.findIndex((s) => s.id === draggedId);
     const dropIndex = orderedSections.findIndex((s) => s.id === dropId);
 
     const newSections = [...orderedSections];
     const [draggedSection] = newSections.splice(draggedIndex, 1);
     newSections.splice(dropIndex, 0, draggedSection);
 
     setOrderedSections(newSections);
     saveOrder(newSections);
     setDraggedId(null);
     setDragOverId(null);
   };
 
   return (
     <div className="space-y-6">
       {orderedSections.map((section) => (
         <div
           key={section.id}
           draggable
           onDragStart={(e) => handleDragStart(e, section.id)}
           onDragEnd={handleDragEnd}
           onDragOver={(e) => handleDragOver(e, section.id)}
           onDragLeave={handleDragLeave}
           onDrop={(e) => handleDrop(e, section.id)}
           className={cn(
             "relative group transition-all duration-200",
             draggedId === section.id && "opacity-50 scale-[0.98]",
             dragOverId === section.id && "ring-2 ring-primary ring-offset-2 rounded-xl"
           )}
         >
           {/* Drag Handle */}
           <div
             className="absolute -left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10 bg-card p-1 rounded shadow-sm border"
             title="Drag to reorder"
           >
             <GripVertical className="h-5 w-5 text-muted-foreground" />
           </div>
           {section.component}
         </div>
       ))}
     </div>
   );
 };
 
 export default DraggableSections;