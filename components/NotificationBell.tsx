import React, { useEffect, useState, useContext } from 'react';
import { Bell } from 'lucide-react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Notification } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../App';

export const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasNew, setHasNew] = useState(false);
  const { language } = useContext(AppContext);

  useEffect(() => {
    const q = query(collection(db, 'notifications'), orderBy('timestamp', 'desc'), limit(5));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
      setNotifications(msgs);
      if (msgs.length > 0) {
        // Simple logic: if latest message is very recent (mock check) or just on load
        setHasNew(true);
      }
    });
    return () => unsubscribe();
  }, []);
  
  const MotionDiv = motion.div as any;

  return (
    <div className="relative z-50">
      <button 
        className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
        onClick={() => {
          setShowDropdown(!showDropdown);
          setHasNew(false);
        }}
      >
        <Bell className="w-6 h-6 text-gray-700 dark:text-neon-blue" />
        {hasNew && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
        )}
        {hasNew && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </button>

      <AnimatePresence>
        {showDropdown && (
          <MotionDiv
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 rtl:left-0 rtl:right-auto mt-2 w-72 bg-white dark:bg-neon-card border border-gray-200 dark:border-neon-blue/30 rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="p-3 bg-gray-50 dark:bg-neon-dark border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-semibold dark:text-white">
                {language === 'en' ? 'Broadcasts' : 'الإشعارات'}
              </h3>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  {language === 'en' ? 'No new messages' : 'لا توجد رسائل جديدة'}
                </div>
              ) : (
                notifications.map(note => (
                  <div key={note.id} className="p-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <p className="text-sm text-gray-800 dark:text-gray-300">{note.message}</p>
                    <span className="text-xs text-gray-400 mt-1 block">
                      {new Date(note.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
};