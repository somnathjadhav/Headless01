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
      <div>
        <h3 className="text-base font-medium text-gray-900 mb-6 flex items-center">
          <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Active Login Sessions
        </h3>
        
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-base font-medium text-gray-900 mb-6 flex items-center">
        <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        Active Login Sessions
      </h3>
      
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ComputerDesktopIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">Active Login Sessions</h4>
              <p className="text-sm text-gray-500">Manage your active sessions across devices</p>
            </div>
          </div>
          
          {sessions.length > 1 && (
            <button
              onClick={terminateAllOtherSessions}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm"
            >
              End All Other Sessions
            </button>
          )}
        </div>

        <div className="space-y-3">
          {sessions.length === 0 ? (
            <div className="text-center py-6">
              <GlobeAltIcon className="h-8 w-8 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No active sessions found</p>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className={`p-4 rounded-lg border transition-all duration-200 ${
                  session.isCurrent
                    ? 'bg-green-50 border-green-200'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      session.isCurrent ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      {getDeviceIcon(session.userAgent)}
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {session.isCurrent ? 'Current Session' : getBrowserInfo(session.userAgent)}
                        </h4>
                        {session.isCurrent && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-3 text-gray-500 mt-1" style={{ fontSize: '14px' }}>
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
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
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

        <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-100">
          <div className="flex items-start space-x-3">
            <GlobeAltIcon className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h5 className="font-medium text-gray-900 text-sm">Security Tips</h5>
              <ul className="text-sm text-gray-600 mt-2 space-y-1">
                <li>• Review your active sessions regularly</li>
                <li>• End sessions from devices you no longer use</li>
                <li>• If you see unfamiliar sessions, change your password immediately</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionManagement;

