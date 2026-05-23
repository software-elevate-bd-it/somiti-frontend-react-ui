import { useDrawSavingsStore } from './drawSavingsStore';

const DEMO_MEMBERS = [
  'Rahim Uddin', 'Karim Ahmed', 'Sadia Akter', 'Jahid Hasan', 'Nusrat Jahan',
  'Mizanur Rahman', 'Tania Sultana', 'Arif Hossain', 'Farhana Rahman', 'Sohel Rana',
  'Rumana Begum', 'Imran Khan',
];

export function seedDrawDemoData() {
  const store = useDrawSavingsStore.getState();

  // Reset existing draw data only (does not touch other modules)
  useDrawSavingsStore.setState({ groups: [], enrollments: [], installments: [], winners: [] });

  const today = new Date();
  const iso = (offsetDays: number) => {
    const d = new Date(today); d.setDate(d.getDate() + offsetDays);
    return d.toISOString().slice(0, 10);
  };

  // Group 1 — Active monthly group with progress
  const g1 = store.createGroup({
    name: 'Monthly Savings Circle 2026',
    drawType: 'monthly',
    startDate: iso(-90),
    totalMembers: 10,
    installmentAmount: 5000,
    totalCycles: 10,
    drawMethod: 'random',
    status: 'active',
  });
  store.enrollMembers(
    g1.id,
    DEMO_MEMBERS.slice(0, 10).map((n, i) => ({ id: `demo-m-${i + 1}`, name: n }))
  );
  // Generate 3 cycles of installments
  for (let c = 1; c <= 3; c++) store.generateCycle(g1.id, c);
  // Mark most as paid for cycles 1-2, partial/due for cycle 3
  const installments = useDrawSavingsStore.getState().groupInstallments(g1.id);
  installments.forEach((i, idx) => {
    if (i.cycleNumber <= 2) store.recordPayment(i.id, i.dueAmount);
    else if (idx % 3 === 0) store.recordPayment(i.id, i.dueAmount / 2);
    else if (idx % 3 === 1) store.recordPayment(i.id, i.dueAmount);
  });
  // Run draws for cycle 1 (approved) and cycle 2 (pending)
  const w1 = store.executeDraw(g1.id, 1, 'random', undefined, 'admin');
  if (w1) store.approveWinner(w1.id, 'admin');
  store.executeDraw(g1.id, 2, 'random', undefined, 'admin');

  // Group 2 — Weekly group, draft state
  const g2 = store.createGroup({
    name: 'Weekly Shopkeepers Pool',
    drawType: 'weekly',
    startDate: iso(7),
    totalMembers: 8,
    installmentAmount: 1000,
    totalCycles: 8,
    drawMethod: 'manual',
    status: 'draft',
  });
  store.enrollMembers(
    g2.id,
    DEMO_MEMBERS.slice(2, 10).map((n, i) => ({ id: `demo-m-w-${i + 1}`, name: n }))
  );

  // Group 3 — Biweekly token draw, completed
  const g3 = store.createGroup({
    name: 'Bi-Weekly Token Draw Q1',
    drawType: 'biweekly',
    startDate: iso(-180),
    totalMembers: 6,
    installmentAmount: 2500,
    totalCycles: 6,
    drawMethod: 'token',
    status: 'completed',
  });
  store.enrollMembers(
    g3.id,
    DEMO_MEMBERS.slice(0, 6).map((n, i) => ({ id: `demo-m-t-${i + 1}`, name: n }))
  );
  for (let c = 1; c <= 6; c++) {
    store.generateCycle(g3.id, c);
    const ci = useDrawSavingsStore.getState().groupInstallments(g3.id, c);
    ci.forEach((i) => store.recordPayment(i.id, i.dueAmount));
    const w = store.executeDraw(g3.id, c, 'token', undefined, 'admin');
    if (w) store.approveWinner(w.id, 'admin');
  }
}
