"use client";

import React, { useState, useEffect } from 'react';

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  color?: string;
}

interface CalendarProps {
  currentDate: Date;
  events: CalendarEvent[]; // イベントを受け取る
  holidays: { [date: string]: string }; // 祝日データ (例: {"2025-01-01": "元日"})
  onEventClick: (event: CalendarEvent) => void; // イベントクリック時のコールバック
}

const Calendar: React.FC<CalendarProps> = ({ currentDate, events, holidays, onEventClick }) => {
  const [daysInMonth, setDaysInMonth] = useState<Date[]>([]);

  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const numDays = lastDayOfMonth.getDate();

    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0:日, 1:月, ..., 6:土

    const days: Date[] = [];

    // 前月の日付（カレンダーの先頭を埋めるため）
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push(new Date(year, month - 1, prevMonthLastDay - i));
    }

    // 当月の日付
    for (let i = 1; i <= numDays; i++) {
      days.push(new Date(year, month, i));
    }

    // 次月の日付（カレンダーの末尾を埋めるため、42マスになるように調整）
    const totalCells = 42; // 6週 x 7日
    const remainingCells = totalCells - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      days.push(new Date(year, month + 1, i));
    }

    setDaysInMonth(days);
  }, [currentDate]);

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth() &&
           date.getFullYear() === currentDate.getFullYear();
  }

  return (
    <div className="calendar">
      <div className="calendar-grid-header">
        {['日', '月', '火', '水', '木', '金', '土'].map(day => (
          <div key={day} className="day-of-week">{day}</div>
        ))}
      </div>
      <div className="calendar-grid">
        {daysInMonth.map((date, index) => {
          const dayEvents = events.filter(event =>
            event.start.getFullYear() === date.getFullYear() &&
            event.start.getMonth() === date.getMonth() &&
            event.start.getDate() === date.getDate()
          );

          const dateString = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
          const isHoliday = holidays.hasOwnProperty(dateString);
          const holidayName = holidays?.[dateString];

          return (
            <div
              key={index}
              className={`calendar-cell
                ${isToday(date) ? 'today' : ''}
                ${isCurrentMonth(date) ? '' : 'other-month'}
                ${isHoliday ? 'holiday' : ''} // 祝日用のクラスを追加
              `}
            >
              <div className="date-number">{date.getDate()}</div>
              {isHoliday && isCurrentMonth(date) && <div className="holiday-name">{holidayName}</div>} {/* 今月の祝日のみ表示 */}
              <div className="events-list">
                {dayEvents.map(event => (
                  <div
                    key={event.id}
                    className="calendar-event-item"
                    style={{ backgroundColor: event.color || '#3498db' }}
                    onClick={() => onEventClick(event)}
                  >
                    {event.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;