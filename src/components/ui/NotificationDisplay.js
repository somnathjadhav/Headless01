import React, { useContext } from 'react';
import { NotificationContext } from '../../context/NotificationContext';
import { CheckIcon, ExclamationIcon, InformationIcon, XIcon } from '../icons';

export default function NotificationDisplay() {
  const { notifications, removeNotification } = useContext(NotificationContext);

  if (!notifications || notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999] space-y-2 pointer-events-none w-72 max-w-[calc(100vw-1rem)] sm:w-80">
      {notifications.map((notification) => {
        const getIcon = () => {
          switch (notification.type) {
            case 'success':
              return <CheckIcon className="w-4 h-4" />;
            case 'error':
              return <ExclamationIcon className="w-4 h-4" />;
            case 'warning':
              return <ExclamationIcon className="w-4 h-4" />;
            case 'info':
            default:
              return <InformationIcon className="w-4 h-4" />;
          }
        };

        const getStyles = () => {
          switch (notification.type) {
            case 'success':
              return 'bg-green-50 border-green-200 text-green-800';
            case 'error':
              return 'bg-red-50 border-red-200 text-red-800';
            case 'warning':
              return 'bg-yellow-50 border-yellow-200 text-yellow-800';
            case 'info':
            default:
              return 'bg-blue-50 border-blue-200 text-blue-800';
          }
        };

        return (
          <div
            key={notification.id}
            className={`w-full bg-white shadow-lg rounded-md pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden border ${getStyles()}`}
          >
            <div className="p-2">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {getIcon()}
                </div>
                <div className="ml-2 w-0 flex-1">
                  <p className="text-xs font-medium leading-tight">
                    {notification.message}
                  </p>
                </div>
                <div className="ml-1 flex-shrink-0 flex">
                  <button
                    className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() => removeNotification(notification.id)}
                  >
                    <span className="sr-only">Close</span>
                    <XIcon className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
