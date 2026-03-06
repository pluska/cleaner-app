"use client";

import { useState, useEffect, useRef } from "react";
import { format, addMonths, subMonths, getDaysInMonth, startOfMonth, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarStripProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export function CalendarStrip({ selectedDate, onSelectDate }: CalendarStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(selectedDate));
  
  // Generate days for the currently viewed month
  const daysInMonth = getDaysInMonth(currentMonth);
  const days = Array.from({ length: daysInMonth }).map((_, i) => {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1);
    return {
      dateObj: d,
      dayName: format(d, 'EEE').toUpperCase(),
      dayNum: d.getDate(),
      isToday: isSameDay(d, new Date()),
    };
  });

  // Handle horizontal scroll with mouse wheel
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      const handleWheel = (e: WheelEvent) => {
        if (e.deltaY !== 0) {
          e.preventDefault();
          el.scrollLeft += e.deltaY;
        }
      };
      el.addEventListener('wheel', handleWheel, { passive: false });
      return () => el.removeEventListener('wheel', handleWheel);
    }
  }, []);

  // Auto-center the selected date (or the 1st of the month if changing months)
  useEffect(() => {
    if (scrollRef.current) {
      const selectedEl = scrollRef.current.querySelector('[data-selected="true"]') as HTMLElement;
      if (selectedEl) {
        // Center the element in the scroll container
        const container = scrollRef.current;
        const scrollLeft = selectedEl.offsetLeft - container.offsetWidth / 2 + selectedEl.offsetWidth / 2;
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      } else {
        // If selected date is not in this month, scroll to the start
        scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      }
    }
  }, [currentMonth, selectedDate]);

  const handlePrevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));

  return (
    <div className="mb-6 -mx-6 md:-mx-8">
      {/* Month Navigation Header */}
      <div className="flex items-center justify-between px-6 md:px-8 mb-4">
        <h3 className="text-lg font-bold text-dark capitalize">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <div className="flex space-x-2">
          <button 
            onClick={handlePrevMonth}
            className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-500 hover:text-primary hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={handleNextMonth}
            className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-500 hover:text-primary hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable Dates */}
      <div 
        ref={scrollRef}
        className="px-6 md:px-8 overflow-x-auto scroll-smooth pb-4 [&::-webkit-scrollbar]:hidden"
        style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
      >
        <div className="flex space-x-3 md:space-x-4 w-max">
          {days.map((day, idx) => {
             const isSelected = isSameDay(selectedDate, day.dateObj);
            return (
              <div
                key={idx}
                data-selected={isSelected}
                onClick={() => onSelectDate(day.dateObj)}
                className={`flex flex-col items-center justify-center w-[60px] h-[85px] rounded-[24px] cursor-pointer transition-colors shrink-0 ${
                  isSelected
                    ? "bg-primary text-white"
                    : "bg-white text-dark shadow-sm border border-gray-50 hover:bg-gray-50"
                }`}
              >
                <span
                  className={`text-[10px] font-bold mb-1 ${
                    isSelected ? "text-gray-300" : "text-gray-400"
                  }`}
                >
                  {day.dayName}
                </span>
                <span className="text-xl font-bold">{day.dayNum}</span>
                {day.isToday && !isSelected && (
                  <div className="w-1 h-1 bg-primary rounded-full mt-1"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
