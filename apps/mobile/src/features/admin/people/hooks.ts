import type { StaffRole } from '@mcc/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { adminKeys } from '../shared/keys';
import {
  addStaff,
  exportStudentsCsv,
  fetchDashboardStats,
  fetchStaff,
  fetchStudents,
  removeStaff,
} from './api';

export function useDashboardStats() {
  return useQuery({ queryKey: adminKeys.dashboard, queryFn: fetchDashboardStats });
}

export function useStudents() {
  return useQuery({ queryKey: adminKeys.students, queryFn: fetchStudents });
}

export function useExportStudents() {
  return useMutation({ mutationFn: exportStudentsCsv });
}

export function useStaffList() {
  return useQuery({ queryKey: adminKeys.staff, queryFn: fetchStaff });
}

export function useStaffActions() {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: adminKeys.staff });
  return {
    add: useMutation({
      mutationFn: ({ email, role }: { email: string; role: StaffRole }) => addStaff(email, role),
      onSuccess: refresh,
    }),
    remove: useMutation({ mutationFn: removeStaff, onSuccess: refresh }),
  };
}
