import React from 'react';
import { CalendarView } from './CalendarView';
import { useAuth } from '../contexts/AuthContext';

export function CalendarPage() {
  const { user, sessions } = useAuth();

  const handleSessionClick = (session) => {
    // Handle session click - could open a modal or navigate to session details
    console.log('Session clicked:', session);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Calendar View</h1>
        <p className="mt-2 text-gray-400">View all your sessions in a calendar format</p>
      </div>

      <CalendarView
        sessions={sessions}
        user={user}
        onSessionClick={handleSessionClick}
      />
    </div>
  );
}
