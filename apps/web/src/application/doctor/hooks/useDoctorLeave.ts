import { useState, useEffect, useCallback, useMemo } from "react";
import {
  type LeaveRequest,
  type LeaveType,
  applyLeave,
  getMyLeaves,
  cancelLeave,
  type ApplyLeavePayload,
  TOTAL_LEAVES_PER_YEAR,
  LEAVE_TYPES,
} from "@/infrastructure/api/leave.api";
import { toast } from "sonner";

/** Number of calendar days spanned by a leave (inclusive) */
const daysBetween = (start: string, end: string) =>
  Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86_400_000) + 1;

export function useDoctorLeave() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const fetchLeaves = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMyLeaves();
      setLeaves(data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load leave requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const submitLeave = async (payload: ApplyLeavePayload) => {
    try {
      setSubmitting(true);
      const newLeave = await applyLeave(payload);
      setLeaves((prev) => [newLeave, ...prev]);
      toast.success("Leave request submitted successfully.");
      return true;
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to submit leave request.");
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const deleteLeave = async (id: string) => {
    try {
      setCancelling(id);
      await cancelLeave(id);
      setLeaves((prev) => prev.filter((l) => l.id !== id));
      toast.success("Leave request cancelled.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to cancel leave request.");
    } finally {
      setCancelling(null);
    }
  };

  /** Leave balance — computed from APPROVED leaves only */
  const leaveBalance = useMemo(() => {
    const approved = leaves.filter((l) => l.status === "APPROVED");
    const usedByType: Partial<Record<LeaveType, number>> = {};

    for (const l of approved) {
      const days = daysBetween(l.startDate, l.endDate);
      usedByType[l.leaveType] = (usedByType[l.leaveType] ?? 0) + days;
    }

    const totalUsed = Object.values(usedByType).reduce((s, v) => s + (v ?? 0), 0);
    const remaining = Math.max(0, TOTAL_LEAVES_PER_YEAR - totalUsed);

    return {
      total: TOTAL_LEAVES_PER_YEAR,
      totalUsed,
      remaining,
      usedByType,
      leaveTypes: LEAVE_TYPES,
    };
  }, [leaves]);

  return {
    leaves,
    loading,
    submitting,
    cancelling,
    submitLeave,
    deleteLeave,
    refetch: fetchLeaves,
    leaveBalance,
  };
}
