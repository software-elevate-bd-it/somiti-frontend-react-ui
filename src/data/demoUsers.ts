import type { User } from '@/lib/api';

export interface DemoUser {
  email: string;
  password: string;
  user: User & { roleIds?: string[] };
  label: string;
  description: string;
}

/**
 * Demo users for offline / no-backend mode.
 * If the API is unreachable, login falls back to these.
 * Passwords are intentionally simple for demo only.
 */
export const DEMO_USERS: DemoUser[] = [
  {
    email: 'admin@somitee.dev',
    password: '123456',
    label: 'Main User',
    description: 'Main user for demo login',
    user: {
      id: 'demo-main-1',
      name: 'Main User',
      email: 'admin@somitee.dev',
      role: 'main_user',
      somiteeId: 's1',
      somiteeName: 'মুরাদপুর ব্যবসায়ী সমবায় সমিতি লিঃ',
      phone: '01711111111',
      profilePhoto: null,
    },
  },
];

export function findDemoUser(email: string, password: string): DemoUser | undefined {
  return DEMO_USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password
  );
}
