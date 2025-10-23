import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, Users } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { formatIST } from '../utils/timezone';

export function CalendarView({ sessions, user, onSessionClick }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Filter sessions based on user role
  const getFilteredSessions = () => {
    if (user.role === 'admin') {
      return sessions;
    } else if (user.role === 'trainer') {
      return sessions.filter(s => s.trainer === user.id);
    } else {
      // trainee - sessions are already filtered on backend
      return sessions;
    }
  };

  const filteredSessions = getFilteredSessions();

  // Get sessions for a specific date
  const getSessionsForDate = (date) => {
    return filteredSessions.filter(session => {
      const sessionDate = new Date(session.startTime || session.scheduled_date);
      return isSameDay(sessionDate, date);
    });
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-600';
      case 'in-progress':
        return 'bg-green-600';
      case 'completed':
        return 'bg-gray-600';
      case 'cancelled':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Calendar className="h-6 w-6 text-gray-400" />
          <h3 className="text-lg font-semibold text-white">Session Calendar</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-white" />
          </button>
          <h4 className="text-white font-medium min-w-[200px] text-center">
            {format(currentDate, 'MMMM yyyy')}
          </h4>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>

      {/* Calendar Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center text-gray-400 text-sm font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          const daySessions = getSessionsForDate(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={index}
              className={`min-h-[100px] p-2 border border-gray-600 rounded-lg ${
                isCurrentMonth ? 'bg-gray-700' : 'bg-gray-800'
              } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
            >
              <div className="text-sm font-medium mb-1">
                <span className={isCurrentMonth ? 'text-white' : 'text-gray-500'}>
                  {format(day, 'd')}
                </span>
              </div>

              <div className="space-y-1">
                {daySessions.slice(0, 2).map((session) => (
                  <div
                    key={session.id}
                    onClick={() => onSessionClick && onSessionClick(session)}
                    className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity ${
                      getStatusColor(session.status)
                    }`}
                  >
                    <div className="font-medium truncate">{session.title}</div>
                    <div className="flex items-center space-x-1 text-xs opacity-90">
                      <Clock className="h-3 w-3" />
                      <span>{formatIST(session.startTime || session.scheduled_date, 'time')}</span>
                    </div>
                  </div>
                ))}

                {daySessions.length > 2 && (
                  <div className="text-xs text-gray-400">
                    +{daySessions.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-600 rounded"></div>
          <span className="text-gray-300">Scheduled</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-600 rounded"></div>
          <span className="text-gray-300">In Progress</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-600 rounded"></div>
          <span className="text-gray-300">Completed</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-600 rounded"></div>
          <span className="text-gray-300">Cancelled</span>
        </div>
      </div>
    </div>
  );
}
