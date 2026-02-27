export interface Member {
  id: string;
  name: string;
  email: string;
  tier: "Platinum" | "Gold" | "Silver";
  memberSince: string;
  flights: number;
  photoUrl: string;
  passportNumber: string;
  nationality: string;
  lastAccess?: string;
  status: "active" | "expired" | "suspended";
}

export interface AccessLog {
  id: string;
  memberId: string;
  memberName: string;
  tier: string;
  timestamp: string;
  status: "granted" | "denied" | "pending";
  confidence: number;
  photoUrl: string;
}

export const mockMembers: Member[] = [
  {
    id: "1", name: "Alexandra Chen", email: "a.chen@email.com", tier: "Platinum",
    memberSince: "2019-03-15", flights: 247, photoUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=200&h=200&fit=crop&crop=face",
    passportNumber: "E8291034", nationality: "Singapore", lastAccess: "2026-02-27 08:32", status: "active",
  },
  {
    id: "2", name: "James Morrison", email: "j.morrison@email.com", tier: "Platinum",
    memberSince: "2018-07-22", flights: 312, photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    passportNumber: "P4517823", nationality: "United Kingdom", lastAccess: "2026-02-27 07:15", status: "active",
  },
  {
    id: "3", name: "Sophia Nakamura", email: "s.nakamura@email.com", tier: "Gold",
    memberSince: "2021-01-10", flights: 89, photoUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
    passportNumber: "TK7291045", nationality: "Japan", lastAccess: "2026-02-26 19:45", status: "active",
  },
  {
    id: "4", name: "Marco Rossi", email: "m.rossi@email.com", tier: "Gold",
    memberSince: "2020-11-03", flights: 134, photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
    passportNumber: "YA2038471", nationality: "Italy", lastAccess: "2026-02-27 06:50", status: "active",
  },
  {
    id: "5", name: "Priya Sharma", email: "p.sharma@email.com", tier: "Silver",
    memberSince: "2023-05-18", flights: 42, photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face",
    passportNumber: "J8103752", nationality: "India", status: "active",
  },
  {
    id: "6", name: "Erik Lindström", email: "e.lindstrom@email.com", tier: "Silver",
    memberSince: "2024-02-01", flights: 18, photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    passportNumber: "SE9281034", nationality: "Sweden", status: "expired",
  },
];

export const mockAccessLogs: AccessLog[] = [
  { id: "l1", memberId: "1", memberName: "Alexandra Chen", tier: "Platinum", timestamp: "2026-02-27 08:32:15", status: "granted", confidence: 98.7, photoUrl: mockMembers[0].photoUrl },
  { id: "l2", memberId: "2", memberName: "James Morrison", tier: "Platinum", timestamp: "2026-02-27 07:15:42", status: "granted", confidence: 96.2, photoUrl: mockMembers[1].photoUrl },
  { id: "l3", memberId: "0", memberName: "Unknown", tier: "-", timestamp: "2026-02-27 06:58:03", status: "denied", confidence: 32.1, photoUrl: "" },
  { id: "l4", memberId: "4", memberName: "Marco Rossi", tier: "Gold", timestamp: "2026-02-27 06:50:11", status: "granted", confidence: 94.8, photoUrl: mockMembers[3].photoUrl },
  { id: "l5", memberId: "3", memberName: "Sophia Nakamura", tier: "Gold", timestamp: "2026-02-26 19:45:30", status: "granted", confidence: 97.1, photoUrl: mockMembers[2].photoUrl },
];
