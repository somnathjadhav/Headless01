import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ComputerDesktopIcon, DevicePhoneMobileIcon, GlobeAltIcon, TrashIcon } from '@heroicons/react/24/outline';

const SessionManagement = () => {
  const { user, isAuthenticated } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchSessions();
    }
  }, [isAuthenticated, user]);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/auth/sessions', {
        headers: {
          'x-user-id': user.id,
          'x-user-email': user.email,
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const terminateSession = async (sessionId) => {
    try {
      const response = await fetch('/api/auth/sessions/terminate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
          'x-user-email': user.email,
        },
        body: JSON.stringify({ sessionId }),
      });

      if (response.ok) {
        setSessions(sessions.filter(session => session.id !== sessionId));
      }
    } catch (error) {
      console.error('Error terminating session:', error);
    }
  };

  const terminateAllOtherSessions = async () => {
    try {
      const response = await fetch('/api/auth/sessions/terminate-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
          'x-user-email': user.email,
        },
      });

      if (response.ok) {
        // Keep only current session
        const currentSession = sessions.find(session => session.isCurrent);
        setSessions(currentSession ? [currentSession] : []);
      }
    } catch (error) {
      console.error('Error terminating all sessions:', error);
    }
  };

  const getDeviceIcon = (userAgent) => {
    if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
      return <DevicePhoneMobileIcon className="h-5 w-5 text-blue-600" />;
    }
    return <ComputerDesktopIcon className="h-5 w-5 text-gray-600" />;
  };

  const getBrowserInfo = (userAgent) => {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown Browser';
  };

  const formatLastActive = (lastActive) => {
    const date = new Date(lastActive);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl">
            <ComputerDesktopIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Active Login Sessions</h3>
            <p className="text-sm text-gray-500">Manage your active sessions across devices</p>
          </div>
        </div>
        
        {sessions.length > 1 && (
          <button
            onClick={terminateAllOtherSessions}
            className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors duration-200 text-sm font-medium"
          >
            End All Other Sessions
          </button>
        )}
      </div>

      <div className="space-y-4">
        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <GlobeAltIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No active sessions found</p>
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className={`p-4 rounded-2xl border transition-all duration-200 ${
                session.isCurrent
                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-xl ${
                    session.isCurrent ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {getDeviceIcon(session.userAgent)}
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900">
                        {session.isCurrent ? 'Current Session' : getBrowserInfo(session.userAgent)}
                      </h4>
                      {session.isCurrent && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <span>{session.location || 'Unknown Location'}</span>
                      <span>•</span>
                      <span>{session.ipAddress}</span>
                      <span>•</span>
                      <span>Last active: {formatLastActive(session.lastActive)}</span>
                    </div>
                  </div>
                </div>
                
                {!session.isCurrent && (
                  <button
                    onClick={() => terminateSession(session.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-200"
                    title="Terminate session"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
        <div className="flex items-start space-x-3">
          <GlobeAltIcon className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h5 className="font-medium text-gray-900 text-sm">Security Tips</h5>
            <ul className="text-xs text-gray-600 mt-1 space-y-1">
              <li>• Review your active sessions regularly</li>
              <li>• End sessions from devices you no longer use</li>
              <li>• If you see unfamiliar sessions, change your password immediately</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionManagement;
