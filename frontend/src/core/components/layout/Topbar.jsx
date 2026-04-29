import { RiSearchLine, RiNotification3Line, RiMenuLine, RiCheckDoubleLine, RiTimeLine, RiSunLine, RiMoonLine } from 'react-icons/ri';
import { useAuthContext } from '../../context/AuthContext';
import { useSidebarContext } from '../../context/SidebarContext';
import { useNotificationContext } from '../../context/NotificationContext';
import Avatar from '../ui/Avatar';
import { useState, useEffect } from 'react';
import notificationsData from '../../../data/notifications.json';
import { formatRelativeTime } from '../../utils/formatters';
import GlobalSearch from './GlobalSearch';

export default function Topbar() {
  const { user, logout, updatePreferences } = useAuthContext();
  const { openMobile } = useSidebarContext();
  const { unreadCount, notifications, loadNotifications, markAsRead, markAllRead } = useNotificationContext();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const currentTheme = user?.preferences?.theme || 'light';
  const isDark = currentTheme === 'dark';

  const toggleTheme = async () => {
    const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
    await updatePreferences({ theme: nextTheme });
  };

  useEffect(() => {
    // Load mock notifications on mount
    loadNotifications(notificationsData);
  }, [loadNotifications]);

  return (
    <header className="sticky top-0 z-30 h-16 bg-surface-primary/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-4 lg:px-6">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <button onClick={openMobile} className="lg:hidden p-2 rounded-none text-content-secondary hover:bg-surface-hover">
          <RiMenuLine className="w-5 h-5" />
        </button>
        <div className="hidden sm:flex items-center relative">
          <GlobalSearch />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Mobile search */}
        <button className="sm:hidden p-2 rounded-none text-content-secondary hover:bg-surface-hover">
          <RiSearchLine className="w-5 h-5" />
        </button>

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-none text-content-secondary hover:bg-surface-hover transition-colors"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <RiSunLine className="w-5 h-5 text-yellow-400" /> : <RiMoonLine className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
            className="relative p-2 rounded-none text-content-secondary hover:bg-surface-hover transition-colors"
          >
            <RiNotification3Line className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-brand-pink text-white text-[10px] font-bold rounded-none flex items-center justify-center min-w-[18px] h-[18px]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-surface-card border border-border rounded-none shadow-dropdown z-50 animate-scale-in overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-surface-elevated">
                  <h3 className="text-sm font-semibold text-content-primary">Notifications</h3>
                  <button 
                    onClick={() => markAllRead()}
                    className="text-xs text-brand-teal hover:text-brand-teal-light flex items-center gap-1 transition-colors"
                  >
                    <RiCheckDoubleLine className="w-4 h-4" />
                    Mark all as read
                  </button>
                </div>
                
                <div className="max-h-80 overflow-y-auto scrollbar-hide">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-content-tertiary">No notifications found</div>
                  ) : (
                    notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={`p-4 border-b last:border-b-0 border-border group relative transition-colors ${n.read ? 'opacity-60 grayscale-[0.5]' : 'bg-brand-teal/5'}`}
                        onClick={() => markAsRead(n.id)}
                      >
                        <div className="flex gap-3">
                          <div className={`w-10 h-10 rounded-none flex items-center justify-center flex-shrink-0 ${n.read ? 'bg-surface-hover text-content-tertiary' : 'bg-brand-teal/15 text-brand-teal'}`}>
                            <RiTimeLine className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className={`text-sm font-medium ${n.read ? 'text-content-secondary' : 'text-content-primary'}`}>{n.title}</p>
                              {!n.read && <div className="w-2 h-2 rounded-none bg-brand-teal flex-shrink-0" />}
                            </div>
                            <p className="text-xs text-content-secondary line-clamp-2 mt-0.5">{n.message}</p>
                            <p className="text-[10px] text-content-tertiary mt-1.5">{formatRelativeTime(n.time)}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="p-2 border-t border-border text-center">
                  <button className="text-xs text-content-tertiary hover:text-content-primary transition-colors py-1">View all notifications</button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 p-1.5 rounded-none hover:bg-surface-hover transition-colors"
          >
            <Avatar name={user?.name} size="sm" />
            <div className="hidden md:block text-left">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-content-primary leading-tight">{user?.name}</p>
                {user?.subRole && (
                  <span className="text-[10px] font-black bg-brand-teal/10 text-brand-teal px-1.5 py-0.5 uppercase tracking-wider">
                    {user.subRole.replace('_', ' ')}
                  </span>
                )}
              </div>
              <p className="text-xs text-content-tertiary capitalize">{user?.role}</p>
            </div>
          </button>

          {showProfile && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)} />
              <div className="absolute right-0 top-full mt-2 w-56 bg-surface-card border border-border rounded-none shadow-dropdown z-50 animate-scale-in overflow-hidden">
                <div className="p-4 border-b border-border">
                  <p className="text-sm font-semibold text-content-primary">{user?.name}</p>
                  <p className="text-xs text-content-secondary">{user?.email}</p>
                </div>
                <div className="p-2">
                  <button
                    onClick={logout}
                    className="w-full text-left px-3 py-2 text-sm text-state-danger rounded-none hover:bg-state-danger/10 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
