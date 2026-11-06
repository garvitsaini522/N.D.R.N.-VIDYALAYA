import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { portalApi } from '../services/portalApi';
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
          name: user.wardName || 'Student Ward',
          grade: user.wardGrade || 'Primary Wing',
          admissionNo: user.wardAdmissionNo || user.wardId,
          rollNo: user.wardRollNo || '—',
          parentName: user.name || 'Parent / Guardian',
          parentPhone: user.phone || '',
          status: 'Active',
          attendancePercent: 0,
          feeStatus: '—',
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

  // Keep available wards up to date if user changes, fetching from real API when wardIds exist
  useEffect(() => {
    let isMounted = true;
    const initialWards = getInitialWards();
    setAvailableWards(initialWards);

    async function syncRealWards() {
      if (user?.role === 'parent' && Array.isArray(user?.wardIds) && user.wardIds.length > 0) {
        try {
          const wardPromises = user.wardIds.map((id) => portalApi.getStudent(id));
          const results = await Promise.all(wardPromises);
          const realWards = results
            .map((res) => res.data)
            .filter(Boolean)
            .map((s) => ({
              ...s,
              id: s._id || s.id,
              name: s.fullName || s.name,
              grade: s.class?.name ? `${s.class.name}-${s.class.section || 'A'}` : (s.grade || 'Primary Wing'),
              admissionNo: s.admissionNumber || s.admissionNo || s.id,
              rollNo: s.rollNumber || s.rollNo || '—',
            }));

          if (isMounted && realWards.length > 0) {
            setAvailableWards(realWards);
            const saved = localStorage.getItem('ndrn_portal_active_ward_id');
            if (!saved || !realWards.some((w) => w.id === saved)) {
              setActiveWardId(realWards[0].id);
              localStorage.setItem('ndrn_portal_active_ward_id', realWards[0].id);
            }
            return;
          }
        } catch {
          // Fall back to initial wards
        }
      }

      if (isMounted) {
        const saved = localStorage.getItem('ndrn_portal_active_ward_id');
        if (!saved || !initialWards.some((w) => w.id === saved)) {
          if (initialWards.length > 0) {
            setActiveWardId(initialWards[0].id);
            localStorage.setItem('ndrn_portal_active_ward_id', initialWards[0].id);
          } else {
            setActiveWardId(null);
            localStorage.removeItem('ndrn_portal_active_ward_id');
          }
        }
      }
    }

    syncRealWards();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const switchWard = (wardId) => {
    const found = availableWards.find((w) => w.id === wardId);
    if (found) {
      setActiveWardId(wardId);
      localStorage.setItem('ndrn_portal_active_ward_id', wardId);
    }
  };

  const updateWardData = (wardId, updatedFields) => {
    setAvailableWards((prev) =>
      prev.map((w) =>
        w.id === wardId || w.admissionNo === wardId
          ? { ...w, ...updatedFields }
          : w
      )
    );
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
        updateWardData,
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
