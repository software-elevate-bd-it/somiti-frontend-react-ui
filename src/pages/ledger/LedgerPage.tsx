import DataTable, { Column } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { useLedgerStore, type Transaction } from '@/stores/ledgerStore';
import { useMembersStore } from '@/stores/membersStore';

const allColumns: Column<Transaction>[] = [
  { key: 'date', label: 'Date', sortable: true },
  { key: 'memberName', label: 'Member' },
  { key: 'type', label: 'Type', render: (t) => <Badge variant={t.type === 'collection' ? 'default' : 'secondary'}>{t.type || 'N/A'}</Badge> },
  { key: 'category', label: 'Category', render: (t)=>`${t.referenceType}`},
  { key: 'amount', label: 'Amount', render: (t) => `৳${t.balance}` },
  // { key: 'status', label: 'Status', render: (t) => <Badge variant={t.status === 'approved' ? 'default' : 'secondary'}>{t.status || 'N/A'}</Badge> },
];

export default function LedgerPage() {
  const [selectedMember, setSelectedMember] = useState<string>('all');
  
  const transactions = useLedgerStore((s) => s.transactions) || [];
  const isLoading = useLedgerStore((s) => s.isLoading);
  const loadLedger = useLedgerStore((s) => s.loadLedger);
  
  const members = useMembersStore((s) => s.members);
  const loadMembers = useMembersStore((s) => s.loadMembers);

  useEffect(() => {
    loadLedger();
    loadMembers();
  }, [loadLedger, loadMembers]);

  const filtered = Array.isArray(transactions) ? (selectedMember === 'all' ? transactions : transactions.filter(t => t.memberId === selectedMember)) : [];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-heading font-bold">Ledger</h1><p className="text-muted-foreground">Complete transaction history</p></div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Transactions</TabsTrigger>
          <TabsTrigger value="member">By Member</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <Card><CardContent className="pt-6"><DataTable data={transactions} columns={allColumns} searchKey="memberName" /></CardContent></Card>
        </TabsContent>
        <TabsContent value="member" className="space-y-4">
          <Select value={selectedMember} onValueChange={setSelectedMember}>
            <SelectTrigger className="w-64"><SelectValue placeholder="Select member" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Members</SelectItem>
              {Array.isArray(members) && members.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Card><CardContent className="pt-6"><DataTable data={filtered} columns={allColumns} searchKey="category" /></CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
