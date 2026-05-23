import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type DrawType = 'daily' | 'weekly' | 'biweekly' | 'monthly';
export type DrawMethod = 'random' | 'manual' | 'token';
export type DrawGroupStatus = 'draft' | 'active' | 'completed';
export type InstallmentStatus = 'paid' | 'partial' | 'due';
export type WinnerApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface DrawGroup {
  id: string;
  name: string;
  drawType: DrawType;
  startDate: string;
  totalMembers: number;
  installmentAmount: number;
  totalCycles: number;
  drawMethod: DrawMethod;
  status: DrawGroupStatus;
  createdAt: string;
}

export interface DrawEnrollment {
  id: string;
  groupId: string;
  memberId: string;
  memberName: string;
  joinDate: string;
  position: number;
  eligible: boolean;
  hasWon: boolean;
}

export interface DrawInstallment {
  id: string;
  groupId: string;
  memberId: string;
  memberName: string;
  cycleNumber: number;
  dueAmount: number;
  paidAmount: number;
  status: InstallmentStatus;
  paidAt?: string;
}

export interface DrawWinner {
  id: string;
  groupId: string;
  memberId: string;
  memberName: string;
  cycleNumber: number;
  drawDate: string;
  amount: number;
  approvalStatus: WinnerApprovalStatus;
  approvedBy?: string;
  rejectionNote?: string;
  method: DrawMethod | 'auto-final';
}

interface DrawState {
  groups: DrawGroup[];
  enrollments: DrawEnrollment[];
  installments: DrawInstallment[];
  winners: DrawWinner[];

  createGroup: (g: Omit<DrawGroup, 'id' | 'createdAt'>) => DrawGroup;
  updateGroup: (id: string, patch: Partial<DrawGroup>) => void;
  deleteGroup: (id: string) => void;

  enrollMembers: (groupId: string, members: { id: string; name: string }[]) => void;
  removeEnrollment: (enrollmentId: string) => void;

  generateCycle: (groupId: string, cycleNumber: number) => void;
  recordPayment: (installmentId: string, paidAmount: number) => void;

  executeDraw: (groupId: string, cycleNumber: number, method: DrawMethod | 'auto-final', manualMemberId?: string, currentUser?: string) => DrawWinner | null;
  approveWinner: (winnerId: string, approver: string) => void;
  rejectWinner: (winnerId: string, approver: string, note: string) => void;

  // selectors
  groupEnrollments: (groupId: string) => DrawEnrollment[];
  eligibleMembers: (groupId: string) => DrawEnrollment[];
  groupInstallments: (groupId: string, cycle?: number) => DrawInstallment[];
  groupWinners: (groupId: string) => DrawWinner[];
  groupTotalPot: (groupId: string) => number;
  groupCollected: (groupId: string) => number;
}

const uid = () => Math.random().toString(36).slice(2, 11);

export const useDrawSavingsStore = create<DrawState>()(
  persist(
    (set, get) => ({
      groups: [],
      enrollments: [],
      installments: [],
      winners: [],

      createGroup: (g) => {
        const group: DrawGroup = { ...g, id: uid(), createdAt: new Date().toISOString() };
        set((s) => ({ groups: [group, ...s.groups] }));
        return group;
      },
      updateGroup: (id, patch) => set((s) => ({
        groups: s.groups.map((g) => (g.id === id ? { ...g, ...patch } : g)),
      })),
      deleteGroup: (id) => set((s) => ({
        groups: s.groups.filter((g) => g.id !== id),
        enrollments: s.enrollments.filter((e) => e.groupId !== id),
        installments: s.installments.filter((i) => i.groupId !== id),
        winners: s.winners.filter((w) => w.groupId !== id),
      })),

      enrollMembers: (groupId, members) => {
        const existing = get().enrollments.filter((e) => e.groupId === groupId);
        const startPos = existing.length;
        const fresh: DrawEnrollment[] = members
          .filter((m) => !existing.some((e) => e.memberId === m.id))
          .map((m, idx) => ({
            id: uid(),
            groupId,
            memberId: m.id,
            memberName: m.name,
            joinDate: new Date().toISOString(),
            position: startPos + idx + 1,
            eligible: true,
            hasWon: false,
          }));
        set((s) => ({ enrollments: [...s.enrollments, ...fresh] }));
      },
      removeEnrollment: (enrollmentId) => set((s) => ({
        enrollments: s.enrollments.filter((e) => e.id !== enrollmentId),
      })),

      generateCycle: (groupId, cycleNumber) => {
        const group = get().groups.find((g) => g.id === groupId);
        if (!group) return;
        const enrolls = get().groupEnrollments(groupId);
        const existing = get().installments.filter((i) => i.groupId === groupId && i.cycleNumber === cycleNumber);
        const fresh: DrawInstallment[] = enrolls
          .filter((e) => !existing.some((x) => x.memberId === e.memberId))
          .map((e) => ({
            id: uid(),
            groupId,
            memberId: e.memberId,
            memberName: e.memberName,
            cycleNumber,
            dueAmount: group.installmentAmount,
            paidAmount: 0,
            status: 'due' as InstallmentStatus,
          }));
        set((s) => ({ installments: [...s.installments, ...fresh] }));
      },

      recordPayment: (installmentId, paidAmount) => set((s) => ({
        installments: s.installments.map((i) => {
          if (i.id !== installmentId) return i;
          const status: InstallmentStatus =
            paidAmount >= i.dueAmount ? 'paid' : paidAmount > 0 ? 'partial' : 'due';
          return { ...i, paidAmount, status, paidAt: paidAmount > 0 ? new Date().toISOString() : undefined };
        }),
      })),

      executeDraw: (groupId, cycleNumber, method, manualMemberId, currentUser) => {
        const eligible = get().eligibleMembers(groupId);
        if (eligible.length === 0) return null;

        let chosen: DrawEnrollment | undefined;
        let usedMethod: DrawMethod | 'auto-final' = method;

        if (eligible.length === 1) {
          chosen = eligible[0];
          usedMethod = 'auto-final';
        } else if (method === 'manual' && manualMemberId) {
          chosen = eligible.find((e) => e.memberId === manualMemberId);
        } else {
          chosen = eligible[Math.floor(Math.random() * eligible.length)];
        }
        if (!chosen) return null;

        const group = get().groups.find((g) => g.id === groupId);
        const pot = group ? group.installmentAmount * group.totalMembers : 0;

        const winner: DrawWinner = {
          id: uid(),
          groupId,
          memberId: chosen.memberId,
          memberName: chosen.memberName,
          cycleNumber,
          drawDate: new Date().toISOString(),
          amount: pot,
          approvalStatus: 'pending',
          approvedBy: currentUser,
          method: usedMethod,
        };

        set((s) => ({
          winners: [winner, ...s.winners],
          enrollments: s.enrollments.map((e) =>
            e.id === chosen!.id ? { ...e, hasWon: true, eligible: false } : e
          ),
        }));
        return winner;
      },

      approveWinner: (winnerId, approver) => set((s) => ({
        winners: s.winners.map((w) =>
          w.id === winnerId ? { ...w, approvalStatus: 'approved', approvedBy: approver } : w
        ),
      })),

      rejectWinner: (winnerId, approver, note) => {
        const winner = get().winners.find((w) => w.id === winnerId);
        if (!winner) return;
        set((s) => ({
          winners: s.winners.map((w) =>
            w.id === winnerId
              ? { ...w, approvalStatus: 'rejected', approvedBy: approver, rejectionNote: note }
              : w
          ),
          // Restore eligibility on rejection
          enrollments: s.enrollments.map((e) =>
            e.groupId === winner.groupId && e.memberId === winner.memberId
              ? { ...e, eligible: true, hasWon: false }
              : e
          ),
        }));
      },

      groupEnrollments: (groupId) =>
        get().enrollments.filter((e) => e.groupId === groupId).sort((a, b) => a.position - b.position),
      eligibleMembers: (groupId) =>
        get().enrollments.filter((e) => e.groupId === groupId && e.eligible && !e.hasWon),
      groupInstallments: (groupId, cycle) =>
        get().installments.filter((i) => i.groupId === groupId && (cycle ? i.cycleNumber === cycle : true)),
      groupWinners: (groupId) =>
        get().winners.filter((w) => w.groupId === groupId).sort((a, b) => a.cycleNumber - b.cycleNumber),
      groupTotalPot: (groupId) => {
        const g = get().groups.find((x) => x.id === groupId);
        return g ? g.installmentAmount * g.totalMembers * g.totalCycles : 0;
      },
      groupCollected: (groupId) =>
        get().installments
          .filter((i) => i.groupId === groupId)
          .reduce((sum, i) => sum + i.paidAmount, 0),
    }),
    { name: 'somitee-draw-savings-storage' }
  )
);
