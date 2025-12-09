import { useState, useEffect } from 'react';
import useOfflineStore from '../../store/offlineStore';
import { WifiOff, CloudOff, RefreshCw } from 'lucide-react';

const OfflineIndicator = () => {
  const { isOnline, pendingActions } = useOfflineStore();
  const [show, setShow] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShow(true);
    } else if (pendingActions.length > 0) {
      // Show briefly when coming back online with pending actions
      setShow(true);
      setSyncing(true);
      // Auto sync would happen here
      const timer = setTimeout(() => {
        setSyncing(false);
        if (pendingActions.length === 0) {
          setShow(false);
        }
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [isOnline, pendingActions.length]);

  if (!show) return null;

  return (
    <div 
      className={`fixed bottom-4 left-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border transition-all duration-300 ${
        isOnline 
          ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
          : 'bg-red-500/10 border-red-500/20 text-red-400'
      }`}
    >
      {isOnline ? (
        <>
          {syncing ? (
            <>
              <RefreshCw size={18} className="animate-spin" />
              <div>
                <div className="font-medium text-sm">Syncing changes...</div>
                <div className="text-xs opacity-70">{pendingActions.length} pending</div>
              </div>
            </>
          ) : (
            <>
              <CloudOff size={18} />
              <div>
                <div className="font-medium text-sm">Pending changes</div>
                <div className="text-xs opacity-70">{pendingActions.length} to sync</div>
              </div>
            </>
          )}
        </>
      ) : (
        <>
          <WifiOff size={18} />
          <div>
            <div className="font-medium text-sm">You're offline</div>
            <div className="text-xs opacity-70">Changes will sync when connected</div>
          </div>
        </>
      )}
    </div>
  );
};

export default OfflineIndicator;

