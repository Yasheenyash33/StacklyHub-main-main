import React, { useState, useEffect } from 'react';
import { Calendar, Users, BookOpen, Clock, Search, Filter, Eye, Mail, UserCheck, UserX, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { formatIST } from '../../utils/timezone';
import { CreateSessionModal } from '../Sessions/CreateSessionModal';

export function TrainerDashboard() {
  const { user, users, sessions, assignments, progress, token } = useAuth();
  const [myTraineesData, setMyTraineesData] = useState([]);
  const [loadingTrainees, setLoadingTrainees] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTrainee, setSelectedTrainee] = useState(null);
  const [showCreateSessionModal, setShowCreateSessionModal] = useState(false);

  const mySessions = sessions.filter(s => s.trainer === user.id);
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

  // Filter trainees based on search and status
  const filteredTrainees = myTraineesData.filter(trainee => {
    const matchesSearch = searchTerm === '' ||
      trainee.trainee.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainee.trainee.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainee.trainee.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || trainee.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = [
    {
      name: 'Total Sessions',
      value: mySessions.length,
      icon: BookOpen,
      color: 'bg-green-600',
    },
    {
      name: 'My Trainees',
      value: myTraineesData.length,
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Trainer Dashboard</h1>
          <p className="mt-2 text-gray-400">Manage your sessions and track trainee progress</p>
        </div>
        <button
          onClick={() => setShowCreateSessionModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
        >
          <Plus className="h-5 w-5" />
          <span>Create Session</span>
        </button>
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">My Trainees</h3>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search trainees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {loadingTrainees ? (
              <p className="text-gray-400 text-sm">Loading trainees...</p>
            ) : filteredTrainees.length === 0 ? (
              <p className="text-gray-400 text-sm">
                {myTraineesData.length === 0 ? 'No assigned trainees' : 'No trainees match your filters'}
              </p>
            ) : (
              filteredTrainees.map((item) => (
                <div key={item.trainee.id} className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{item.trainee.first_name} {item.trainee.last_name}</h4>
                        <p className="text-gray-400 text-sm">{item.trainee.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className="text-gray-300 text-sm">Sessions</p>
                        <p className="text-white font-medium">{item.sessions_count}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-300 text-sm">Last Active</p>
                        <p className="text-white text-sm">
                          {item.last_active ? formatIST(item.last_active, 'date') : 'Never'}
                        </p>
                      </div>
                      <div className="text-center">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.status === 'active' ? (
                            <UserCheck className="w-3 h-3 mr-1" />
                          ) : (
                            <UserX className="w-3 h-3 mr-1" />
                          )}
                          {item.status === 'active' ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedTrainee(item)}
                        className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                      >
                        <Eye className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-300 text-sm font-medium">Recent Sessions:</p>
                    {item.sessions.slice(0, 3).map((session) => (
                      <div key={session.id} className="flex justify-between items-center bg-gray-600 rounded p-2">
                        <span className="text-white text-sm font-medium">{session.title}</span>
                        <span className="text-gray-300 text-xs">
                          Created: {formatIST(session.created_at, 'datetime')}
                        </span>
                      </div>
                    ))}
                    {item.sessions.length > 3 && (
                      <p className="text-gray-400 text-xs">+{item.sessions.length - 3} more sessions</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Trainee Details Modal */}
      {selectedTrainee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Trainee Details</h3>
              <button
                onClick={() => setSelectedTrainee(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-medium text-white">
                    {selectedTrainee.trainee.first_name} {selectedTrainee.trainee.last_name}
                  </h4>
                  <p className="text-gray-400">{selectedTrainee.trainee.email}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      selectedTrainee.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedTrainee.status === 'active' ? (
                        <UserCheck className="w-3 h-3 mr-1" />
                      ) : (
                        <UserX className="w-3 h-3 mr-1" />
                      )}
                      {selectedTrainee.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-gray-300 text-sm">
                      Last Active: {selectedTrainee.last_active ? formatIST(selectedTrainee.last_active, 'datetime') : 'Never'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-300 text-sm">Total Sessions</p>
                  <p className="text-2xl font-bold text-white">{selectedTrainee.sessions_count}</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-300 text-sm">Username</p>
                  <p className="text-white font-medium">{selectedTrainee.trainee.username}</p>
                </div>
              </div>
              <div>
                <h5 className="text-white font-medium mb-2">All Sessions</h5>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedTrainee.sessions.map((session) => (
                    <div key={session.id} className="flex justify-between items-center bg-gray-700 rounded p-3">
                      <div>
                        <span className="text-white text-sm font-medium">{session.title}</span>
                        <p className="text-gray-400 text-xs">
                          Created: {formatIST(session.created_at, 'datetime')}
                        </p>
                      </div>
                      <button className="text-blue-400 hover:text-blue-300 text-sm">
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {showCreateSessionModal && (
        <CreateSessionModal
          onClose={() => setShowCreateSessionModal(false)}
          onSuccess={() => setShowCreateSessionModal(false)}
        />
      )}
    </div>
  );
}
