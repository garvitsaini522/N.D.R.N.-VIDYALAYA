import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { DataService } from '../services/dataService';

const PortalContext = createContext(null);

export function PortalProvider({ children }) {
  const { user } = useAuth();

  // Extract available wards for a parent from user profile or genuine database records
  const getInitialWards = () => {
    if (!user || user.role !== 'parent') return [];

    if (Array.isArray(user.wards) && user.wards.length > 0) {
      return user.wards;
    }

    if (user.ward) {
      return [user.ward];
    }

    if (user.wardId) {
      return [
        {
          id: user.wardId,
          name: user.wardName || 'Aarav Sharma',
          grade: user.wardGrade || 'Class 5-A',
          admissionNo: user.wardAdmissionNo || 'NDRN-2026-DEMO',
          rollNo: user.wardRollNo || '15',
          parentName: user.name,
          parentPhone: user.phone,
          status: 'Active',
          attendancePercent: 94.5,
          feeStatus: 'Paid',
          pendingFeeAmount: 0,
        },
      ];
    }

    // Try finding by parent phone / email in DataService
    const allStudents = DataService.getStudents();
    const matched = allStudents.filter(
      (s) =>
        (user.email && s.parentEmail === user.email) ||
        (user.phone && s.parentPhone === user.phone)
    );

    return matched;
  };

  const [availableWards, setAvailableWards] = useState(getInitialWards);
  const [activeWardId, setActiveWardId] = useState(() => {
    const saved = localStorage.getItem('ndrn_portal_active_ward_id');
    const wards = getInitialWards();
    if (saved && wards.some((w) => w.id === saved)) {
      return saved;
    }
    return wards[0]?.id || null;
  });

  // Keep available wards up to date if user changes
  useEffect(() => {
    const wards = getInitialWards();
    setAvailableWards(wards);

    const saved = localStorage.getItem('ndrn_portal_active_ward_id');
    if (!saved || !wards.some((w) => w.id === saved)) {
      if (wards.length > 0) {
        setActiveWardId(wards[0].id);
        localStorage.setItem('ndrn_portal_active_ward_id', wards[0].id);
      } else {
        setActiveWardId(null);
        localStorage.removeItem('ndrn_portal_active_ward_id');
      }
    }
  }, [user]);

  const switchWard = (wardId) => {
    const found = availableWards.find((w) => w.id === wardId);
    if (found) {
      setActiveWardId(wardId);
      localStorage.setItem('ndrn_portal_active_ward_id', wardId);
    }
  };

  // Determine current active student data
  let currentStudent = null;
  if (user?.role === 'student') {
    currentStudent = user.studentProfile || (user.grade ? user : null);
  } else if (user?.role === 'parent') {
    const activeChild = availableWards.find((w) => w.id === activeWardId) || availableWards[0];
    currentStudent = activeChild
      ? {
          ...activeChild,
          parentName: user.name,
          parentPhone: user.phone,
          parentEmail: user.email,
          address: user.address || activeChild.address || '',
          role: 'parent_ward',
        }
      : null;
  }

  const isParent = user?.role === 'parent';
  const isStudent = user?.role === 'student';
  const hasMultipleChildren = isParent && availableWards.length > 1;

  return (
    <PortalContext.Provider
      value={{
        user,
        currentStudent,
        activeWardId,
        availableWards,
        hasMultipleChildren,
        switchWard,
        isParent,
        isStudent,
      }}
    >
      {children}
    </PortalContext.Provider>
  );
}

export function usePortal() {
  const context = useContext(PortalContext);
  if (!context) {
    throw new Error('usePortal must be used within a PortalProvider');
  }
  return context;
}
