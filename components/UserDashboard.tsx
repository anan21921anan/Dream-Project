
import React from 'react';
import { User, PhotoRecord, RechargeRequest, SystemSettings } from '../types';
import Studio from './Studio';
import HistoryView from './HistoryView';
import RechargeView from './RechargeView';

interface UserDashboardProps {
  activeTab: string;
  currentUser: User;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  photos: PhotoRecord[];
  setPhotos: React.Dispatch<React.SetStateAction<PhotoRecord[]>>;
  recharges: RechargeRequest[];
  setRecharges: React.Dispatch<React.SetStateAction<RechargeRequest[]>>;
  settings: SystemSettings;
  onOpenNotifications: () => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({
  activeTab,
  currentUser,
  setCurrentUser,
  users,
  setUsers,
  photos,
  setPhotos,
  recharges,
  setRecharges,
  settings,
  onOpenNotifications
}) => {
  // Fix: Changed p.userId to p.user_id as per the 'PhotoRecord' type definition.
  const userPhotos = photos.filter(p => p.user_id === currentUser.id);
  
  const renderContent = () => {
    switch (activeTab) {
      case 'studio':
        return (
          <Studio 
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            setUsers={setUsers}
            setPhotos={setPhotos}
            generationCost={settings.generationCost}
          />
        );
      case 'history':
        return <HistoryView photos={userPhotos} />;
      case 'recharge':
        return (
          <RechargeView 
            currentUser={currentUser}
            // Fix: Changed r.userId to r.user_id as per the 'RechargeRequest' type definition.
            recharges={recharges.filter(r => r.user_id === currentUser.id)}
            setRecharges={setRecharges}
            settings={settings}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative">
      {renderContent()}
    </div>
  );
};

export default UserDashboard;
