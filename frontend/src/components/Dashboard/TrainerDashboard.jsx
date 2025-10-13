import React, { useState, useEffect } from 'react';
import { Calendar, Users, BookOpen, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { formatIST } from '../../utils/timezone';

export function TrainerDashboard() {
  const { user, users, sessions, assignments, progress, token } = useAuth();
  const [myTraineesData, setMyTraineesData] = useState([]);
  const [loadingTrainees, setLoadingTrainees] = useState(true);

  const mySessions = sessions.filter(s => s.trainer === user.id);
  // Get unique trainee IDs from all sessions created by this trainer
  const myTraineeIds = [...new Set(mySessions.flatMap(s => s.trainees))];
  const myTrainees = users.filter(u => myTraineeIds.includes(u.id));
  const upcomingSessions = mySessions.filter(s => s.status === 'scheduled');
  const completedSessions = mySessions.filter(s => s.status === 'completed');

  // Fetch trainees data from backend
  useEffect(() => {
    const fetchTraineesData = async () => {
      if (!token || !user) return;

      try {
        const response = await fetch(`http://localhost:8002/trainers/${user.id}/trainees`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setMyTraineesData(data);
        } else {
          console.error('Failed to fetch trainees data');
          setMyTraineesData([]);
        }
      } catch (error) {
        console.error('Error fetching trainees data:', error);
        setMyTraineesData([]);
      } finally {
        setLoadingTrainees(false);
      }
    };

    fetchTraineesData();
  }, [token, user]);

  const stats = [
    {
      name: 'Total Sessions',
      value: mySessions.length,
      icon: BookOpen,
      color: 'bg-green-600',
    },
    {
      name: 'My Trainees',
      value: myTrainees.length,
      icon: Users,
      color: 'bg-blue-600',
    },
    {
      name: 'Upcoming',
      value: upcomingSessions.length,
      icon: Calendar,
      color: 'bg-amber-600',
    },
    {
      name: 'Completed',
      value: completedSessions.length,
      icon: Clock,
      color: 'bg-purple-600',
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Trainer Dashboard</h1>
        <p className="mt-2 text-gray-400">Manage your sessions and track trainee progress</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">{stat.name}</p>
                <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} rounded-full p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Sessions */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Upcoming Sessions</h3>
          <div className="space-y-4">
            {upcomingSessions.length === 0 ? (
              <p className="text-gray-400 text-sm">No upcoming sessions</p>
            ) : (
              upcomingSessions.map((session) => (
                <div key={session.id} className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                  <h4 className="font-medium text-white">{session.title}</h4>
                  <p className="text-gray-300 text-sm mt-1">{session.description}</p>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-gray-400 text-sm">
                      {format(new Date(session.startTime), 'MMM d, h:mm a')}
                    </p>
                    <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">
                      {session.trainees.length} trainees
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* My Trainees */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">My Trainees</h3>
          <div className="space-y-4">
            {loadingTrainees ? (
              <p className="text-gray-400 text-sm">Loading trainees...</p>
            ) : myTraineesData.length === 0 ? (
              <p className="text-gray-400 text-sm">No assigned trainees</p>
            ) : (
              myTraineesData.map((item) => (
                <div key={item.trainee.id} className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-white">{item.trainee.first_name} {item.trainee.last_name}</h4>
                      <p className="text-gray-400 text-sm">{item.trainee.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 text-sm font-medium">Active</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {item.sessions.map((session) => (
                      <div key={session.id} className="flex justify-between items-center bg-gray-600 rounded p-2">
                        <span className="text-white text-sm font-medium">{session.title}</span>
                        <span className="text-gray-300 text-xs">
                          Created: {formatIST(session.created_at, 'datetime')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {completedSessions.slice(0, 5).map((session) => (
            <div key={session.id} className="flex items-center space-x-3 bg-gray-700 border border-gray-600 rounded-lg p-4">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-white font-medium">{session.title}</p>
                <p className="text-gray-400 text-sm">
                  Completed on {format(new Date(session.startTime), 'MMM d, yyyy')}
                </p>
              </div>
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                {Object.keys(session.attendance).length} attended
              </span>
            </div>
          ))}
          
          {completedSessions.length === 0 && (
            <p className="text-gray-400 text-sm">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
}