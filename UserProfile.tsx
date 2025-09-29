import React, { useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { getUsers, updateUserRole } from '../services/authService';

interface UserProfileProps {
  user: User;
  onLogout: () => void;
}

const RoleBadge: React.FC<{ role: User['role'] }> = ({ role }) => {
  const roleStyles = {
    admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    convenor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    member: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  };
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full uppercase ${roleStyles[role]}`}>
      {role}
    </span>
  );
};

const UserProfile: React.FC<UserProfileProps> = ({ user, onLogout }) => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    if (user.role !== 'admin') return;
    setIsLoadingUsers(true);
    setError(null);
    try {
      const users = await getUsers();
      setAllUsers(users);
    } catch (e: any) {
      setError(e.message || "Failed to load users.");
    } finally {
      setIsLoadingUsers(false);
    }
  }, [user.role]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  const handleRoleChange = async (targetUserId: number, newRole: 'convenor' | 'member') => {
    try {
      await updateUserRole(targetUserId, newRole);
      // Refresh the list to show the change
      fetchUsers(); 
    } catch (e: any) {
      setError(e.message || `Failed to update role for user ${targetUserId}.`);
    }
  };

  const renderAdminPanel = () => {
    if (user.role !== 'admin') {
      return null;
    }

    return (
      <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Admin Panel</h3>
        {isLoadingUsers ? (
          <p className="text-center text-gray-500 dark:text-gray-400">Loading users...</p>
        ) : error ? (
           <p className="text-center text-red-500 dark:text-red-400">{error}</p>
        ) : (
          <div className="space-y-3">
            {allUsers.filter(u => u.id !== user.id).map(member => (
              <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center">
                  <img src={member.picture} alt={member.name} className="w-10 h-10 rounded-full mr-3"/>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{member.name}</p>
                    <RoleBadge role={member.role} />
                  </div>
                </div>
                <div>
                  {member.role === 'member' && (
                     <button
                      onClick={() => handleRoleChange(member.id, 'convenor')}
                      className="px-3 py-1 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 transition-colors"
                    >
                      Make Convenor
                    </button>
                  )}
                  {member.role === 'convenor' && (
                     <button
                      onClick={() => handleRoleChange(member.id, 'member')}
                      className="px-3 py-1 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600 transition-colors"
                    >
                      Remove Convenor
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <img 
                className="w-32 h-32 rounded-full ring-4 ring-blue-500 dark:ring-blue-400 object-cover shadow-lg"
                src={user.picture} 
                alt={user.name} 
              />
              <div className="absolute -bottom-2 right-0">
                 <RoleBadge role={user.role} />
              </div>
            </div>
            <h1 className="mt-5 text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h1>
            {user.email && <p className="mt-1 text-md text-gray-500 dark:text-gray-400">{user.email}</p>}
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Facebook ID: {user.facebook_id}</p>
          </div>

          <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Login Details</h3>
            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
               <div className="flex justify-between">
                <span>Database ID:</span>
                <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{user.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Logged In At:</span>
                <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{new Date(user.created_at).toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          {renderAdminPanel()}

          <div className="mt-8">
            <button
              onClick={onLogout}
              className="w-full px-4 py-3 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-300 font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;