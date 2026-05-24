import { z } from 'zod';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

// Response schemas
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    statusCode: z.number(),
    message: z.string(),
    data: dataSchema,
    meta: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
    }).optional(),
  });

// TypeScript shape used as the return-type generic for `apiClient` request methods.
// (The runtime zod equivalent is ApiResponseSchema above.)
export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: { page: number; limit: number; total: number; totalPages: number };
}


export const ApiErrorResponseSchema = z.object({
  success: z.literal(false),
  statusCode: z.number(),
  message: z.string(),
  errors: z.array(z.object({
    field: z.string(),
    message: z.string(),
  })),
});

// Auth schemas
export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const RegisterRequestSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  somiteeName: z.string().min(1),
});

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.enum(['super_admin', 'main_user', 'member']),
  somiteeId: z.string().optional(),
  somiteeName: z.string().optional(),
  someiteeName: z.string().optional(),
  profilePhoto: z.string().nullable().optional(),
  phone: z.string().optional(),
  roleIds: z.array(z.string()).optional(),
});

export const LoginResponseSchema = ApiResponseSchema(z.object({
  user: UserSchema,
  token: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
}));

export const RegisterResponseSchema = ApiResponseSchema(z.object({
  user: UserSchema,
  token: z.string(),
}));

// Company schemas
export const CompanySettingsSchema = z.object({
  name: z.string(),
  logo: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  signature: z.string().optional(),
});

// Member schemas
export const MemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  shopName: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  nid: z.string().optional(),
  photo: z.string().optional(),
  status: z.enum(['active', 'inactive']),
  somiteeId: z.string(),
  joinDate: z.string(),
  monthlyFee: z.number(),
  totalDue: z.number(),
  totalPaid: z.number(),
  billingCycle: z.string(),
  paymentLink: z.string().optional(),
});

// Member Request schemas
export const MemberRequestSchema = z.object({
  id: z.string(),

  memberId: z.string().optional(),
  memberRegNumber: z.string().optional(),

  status: z.enum(['pending', 'approved', 'rejected']).optional(),

  nameBn: z.string().optional(),
  nameEn: z.string().optional(),

  fatherName: z.string().optional(),
  motherName: z.string().optional(),

  mobile: z.string().optional(),
  phone: z.string().optional(),

  shopName: z.string().optional(),

  village: z.string().nullable().optional(),
  wardNo: z.string().nullable().optional(),
  union: z.string().nullable().optional(),
  upazila: z.string().nullable().optional(),
  district: z.string().nullable().optional(),

  nid: z.string().optional(),

  dob: z.string().optional(),

  nationality: z.string().optional(),
  religion: z.string().optional(),
  bloodGroup: z.string().optional(),

  nomineeName: z.string().optional(),
  nomineeRelation: z.string().optional(),
  nomineeNid: z.string().optional(),

  monthlyFee: z.number().optional(),
  registrationFee: z.number().optional(),

  billingCycle: z.string().optional(),

  profileImageUrl: z.string().nullable().optional(),
  nidFrontUrl: z.string().nullable().optional(),
  nidBackUrl: z.string().nullable().optional(),
  signatureUrl: z.string().nullable().optional(),

  somiteeId: z.string().optional(),

  rejectionNote: z.string().nullable().optional(),

  approvedAt: z.string().nullable().optional(),
  approvedBy: z.string().nullable().optional(),

  rejectedAt: z.string().nullable().optional(),

  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),

  createdById: z.string().nullable().optional(),
  updatedById: z.string().nullable().optional(),

  appliedAt: z.string().optional(),
});

export type MemberRequest = z.infer<typeof MemberRequestSchema>;

// Collection schemas
export const CollectionSchema = z.object({
  id: z.string(),
  memberId: z.string(),
  memberName: z.string(),
  type: z.string().optional(),
  amount: z.number(),
  date: z.string(),
  category: z.string().optional(),
  method: z.string(),
  status: z.enum(['pending', 'approved', 'rejected']),
  note: z.string().optional(),
  transactionId: z.string().optional(),
  receiptUrl: z.string().optional(),
  createdAt: z.string().optional(),
  approvedBy: z.string().optional(),
  approvedAt: z.string().optional(),
  rejectedBy: z.string().optional(),
  rejectedAt: z.string().optional(),
  rejectionReason: z.string().optional(),
  // Financial year-based collection fields
  financialYear: z.string().optional(),
  months: z.array(z.number()).optional(),
  lateFee: z.number().optional(),
  discount: z.number().optional(),
  totalPaid: z.number().optional(),
  createdBy: z.string().optional(),
});

// Expense schemas
export const ExpenseSchema = z.object({
  id: z.string(),
  type: z.string(),
  amount: z.number(),
  date: z.string(),
  category: z.string(),
  method: z.string(),
  status: z.enum(['pending', 'approved', 'rejected']),
  note: z.string().optional(),
  receiptUrl: z.string().optional(),
  createdAt: z.string(),
});
export const IncomeSchema =
z.object({

id:
z.number(),

title:
z.string(),

type:
z.string(),

amount:
z.number(),

incomeDate:
z.string(),

source:
z.string(),

referenceNo:
z.string(),

description:
z.string().optional(),

note:
z.string().optional(),

bankAccountId:
z.number(),

status:
z.enum([
'received',
'pending'
]),

});

export type Income =
z.infer<
typeof IncomeSchema
>;


// Bank Account schemas
export const BankAccountSchema = z.object({
  id: z.string(),
  bankName: z.string(),
  accountName: z.string(),
  accountNumber: z.string(),
  balance: z.number(),
  openingBalance: z.number(),
  somiteeId: z.string(),
  createdAt: z.string(),
});

// Dashboard schemas
export const DashboardStatsSchema = z.object({
  todayCollection: z.number(),
  pendingDue: z.number(),
  totalBankBalance: z.number(),
  cashInHand: z.number(),
  totalMembers: z.number(),
  activeMembers: z.number(),
  monthlyIncome: z.number(),
  monthlyExpense: z.number(),
  pendingPayments: z.number(),
  recentTransactions: z.array(z.any()),
});

// Role schemas
export const RoleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  permissions: z.array(z.string()),
  isPreset: z.boolean(),
  createdAt: z.string(),
});

// Approval schemas
export const ApprovalSchema = z.object({
  id: z.string(),
  type: z.enum(['collection', 'expense', 'bank', 'member']),
  title: z.string(),
  amount: z.number().optional(),
  description: z.string().optional(),
  payload: z.record(z.any()).default({}),
  status: z.enum(['pending', 'approved', 'rejected']),
  createdBy: z.string(),
  createdByName: z.string(),
  createdAt: z.string(),
  reviewedBy: z.string().optional(),
  reviewedByName: z.string().optional(),
  reviewedAt: z.string().optional(),
  rejectionNote: z.string().optional(),
});

// FAQ schemas
export const FAQSchema = z.object({
  id: z.string(),
  question: z.string(),
  answer: z.string(),
  category: z.string().optional(),
});

export type FAQ = z.infer<typeof FAQSchema>;

// Payment schemas
export const PaymentSchema = z.object({
  id: z.string(),
  memberId: z.string(),
  memberName: z.string(),
  amount: z.number(),
  date: z.string(),
  method: z.string(),
  status: z.enum(['pending', 'verified', 'failed']),
  transactionId: z.string().optional(),
});

export type Payment = z.infer<typeof PaymentSchema>;

// API Client class
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const isFormData = options.body instanceof FormData;
    
    const headers: Record<string, string> = {
      ...(isFormData ? {} : {'Content-Type':'application/json'}),
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
      // console.log(`[API] Request to ${endpoint} with token: ${this.token.substring(0, 20)}...`);
    } else {
      console.warn(`[API] Request to ${endpoint} WITHOUT token!`);
    }

    // console.log(`[API] ${options.method || 'GET'} ${url}`);

    const response = await fetch(url, {
  ...options,
  headers,
});

// =========================
// AUTO REFRESH TOKEN
// =========================

if (
  response.status === 401 &&
  endpoint !== '/auth/refresh-token'
) {

  try {

    const {
      useAuthStore
    } = await import(
      '@/stores/authStore'
    );

    const auth =
      useAuthStore.getState();

    if (
      auth.refreshToken
    ) {

      console.log(
        '[AUTH] Refreshing token...'
      );

      const refresh =
        await this.refreshToken(
          auth.refreshToken
        );

      const newToken =
        refresh.data
          ?.accessToken;

      if (
        !newToken
      ) {

        auth.logout();

        throw new Error(
          'Refresh failed'
        );
      }

      auth.setToken(
        newToken
      );

      headers.Authorization =
        `Bearer ${newToken}`;

      const retry =
        await fetch(
          url,
          {
            ...options,
            headers,
          }
        );

      const retryData =
        await retry.json();

      return retryData;

    }

  } catch {

    const {
      useAuthStore
    } =
      await import(
        '@/stores/authStore'
      );

    useAuthStore
      .getState()
      .logout();
  }
}

const data =
await response.json();

if (
  !response.ok
) {

  throw new ApiError(
    data.message ||
    'Request failed',

    data.errors ||
    []
  );

}

return data;
    
  }

  // Auth endpoints
  async login(credentials: z.infer<typeof LoginRequestSchema>) {
    const validatedData = LoginRequestSchema.parse(credentials);
    return this.request<z.infer<typeof LoginResponseSchema>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(validatedData),
    });
  }

  async register(userData: z.infer<typeof RegisterRequestSchema>) {
    const validatedData = RegisterRequestSchema.parse(userData);
    return this.request<z.infer<typeof RegisterResponseSchema>>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(validatedData),
    });
  }

  async logout() {
    return this.request<ApiResponse<any>>('/auth/logout', {
      method: 'POST',
    });
  }

  async getProfile() {
    return this.request<ApiResponse<z.infer<typeof UserSchema>>>('/auth/me');
  }

  async forgotPassword(email: string) {
    return this.request<ApiResponse<any>>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string) {
    return this.request<ApiResponse<any>>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  async refreshToken(refreshToken: string) {
    return this.request<ApiResponse<any>>('/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  // Company endpoints
  async getCompanySettings() {
    return this.request<ApiResponse<z.infer<typeof CompanySettingsSchema>>>('/company/settings');
  }

  async updateCompanySettings(settings: Partial<z.infer<typeof CompanySettingsSchema>>) {
    return this.request<ApiResponse<z.infer<typeof CompanySettingsSchema>>>('/company/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async uploadCompanyLogo(formData: FormData) {
    return this.request<ApiResponse<any>>('/company/upload-logo', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set content-type for FormData
    });
  }

  async uploadCompanySignature(formData: FormData) {
    return this.request<ApiResponse<any>>('/company/upload-signature', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  }

  // Member endpoints
  async getMembers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.set(key, value.toString());
      });
    }
    return this.request<ApiResponse<z.infer<typeof MemberSchema>[]>>(`/members?${searchParams}`);
  }

  async getMember(id: string) {
    return this.request<ApiResponse<z.infer<typeof MemberSchema>>>(`/members/${id}`);
  }

  async createMember(memberData: {
    name: string;
    shopName?: string;
    phone?: string;
    address?: string;
    nid?: string;
    monthlyFee: number;
    billingCycle?: string;
  }) {
    return this.request<ApiResponse<z.infer<typeof MemberSchema>>>('/members', {
      method: 'POST',
      body: JSON.stringify(memberData),
    });
  }

  async updateMember(id: string, memberData: Partial<z.infer<typeof MemberSchema>>) {
    return this.request<ApiResponse<z.infer<typeof MemberSchema>>>(`/members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(memberData),
    });
  }

  async deleteMember(id: string) {
    return this.request<ApiResponse<null>>(`/members/${id}`, {
      method: 'DELETE',
    });
  }

  async uploadMemberPhoto(id: string, formData: FormData) {
    return this.request<ApiResponse<any>>(`/members/${id}/upload-photo`, {
      method: 'POST',
      body: formData,
      headers: {},
    });
  }

  async getMemberLedger(id: string, params?: {
    page?: number;
    limit?: number;
    dateFrom?: string;
    dateTo?: string;
    type?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.set(key, value.toString());
      });
    }
    return this.request<ApiResponse<any>>(`/members/${id}/ledger?${searchParams}`);
  }

  async getMemberPaymentHistory(id: string, params?: {
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.set(key, value.toString());
      });
    }
    return this.request<ApiResponse<any>>(`/members/${id}/payment-history?${searchParams}`);
  }

  async getMemberDueHistory(id: string) {
    return this.request<ApiResponse<any>>(`/members/${id}/due-history`);
  }

  // Member Requests endpoints
  async getMemberRequests(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.set(key, value.toString());
      });
    }
    return this.request<ApiResponse<z.infer<typeof MemberRequestSchema>[]>>(`/memberRequests?${searchParams}`);
  }

  async approveMemberRequest(id: string, approvalData: {
    monthlyFee: number;
    billingCycle: string;
  }) {
    return this.request<ApiResponse<{
      requestId: string;
      memberId: string;
      name: string;
      status: string;
      approvedAt: string;
    }>>(`/memberRequests/requests/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify(approvalData),
    });
  }

  async rejectMemberRequest(id: string, rejectionData: {
    rejectionNote: string;
  }) {
    return this.request<ApiResponse<{
      requestId: string;
      status: string;
      rejectionNote: string;
      rejectedAt: string;
    }>>(`/memberRequests/requests/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify(rejectionData),
    });
  }

  async deleteMemberRequest(id: string) {
    return this.request<ApiResponse<null>>(`/memberRequests/requests/${id}`, {
      method: 'DELETE',
    });
  }

   async createMemberRequest(formData: FormData) {
    
  return this.request<
    ApiResponse<{
      id: string;
      name: string;
      status: string;
      appliedAt: string;
    }>
  >('/memberRequests/register', {
    method: 'POST',
    body: formData,
  });
}

  // Collections endpoints
  async getCollections(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    method?: string;
    category?: string;
    dateFrom?: string;
    dateTo?: string;
    memberId?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.set(key, value.toString());
      });
    }
    return this.request<ApiResponse<z.infer<typeof CollectionSchema>[]>>(`/collections?${searchParams}`);
  }

  async createCollection(collectionData: {
    memberId: number;
    amount: number;
    date: string;
    category?: string;
    method: string;
    transactionId?: string;
    note?: string;
    // Financial year-based collection
    financialYear?: string;
    months?: number[];
    lateFee?: number;
    discount?: number;
    totalPaid?: number;
  }) {
    return this.request<ApiResponse<z.infer<typeof CollectionSchema>>>('/collections', {
      method: 'POST',
      body: JSON.stringify(collectionData),
    });
  }

  async updateCollection(id: string, collectionData: Partial<z.infer<typeof CollectionSchema>>) {
    return this.request<ApiResponse<z.infer<typeof CollectionSchema>>>(`/collections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(collectionData),
    });
  }

  async deleteCollection(id: string) {
    return this.request<ApiResponse<null>>(`/collections/${id}`, {
      method: 'DELETE',
    });
  }

  async approveCollection(id: string, note?: string) {
    return this.request<ApiResponse<z.infer<typeof CollectionSchema>>>(`/collections/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'approved', note }),
    });
  }

  async rejectCollection(id: string, note: string) {
    return this.request<ApiResponse<z.infer<typeof CollectionSchema>>>(`/collections/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'rejected', note }),
    });
  }

    // Incomes endpoints
    async getIncomes(params?: {
      page?: number;
      limit?: number;
      search?: string;
      type?: string;
      status?: string;
      fromDate?: string;
      toDate?: string;
      bankAccountId?: string;
    }) {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) searchParams.set(key, value.toString());
        });
      }
      return this.request<ApiResponse<any>>(`/incomes?${searchParams}`);
    }

    async createIncome(incomeData: {
      title: string;
      type: string;
      amount: number;
      incomeDate: string;
      source: string;
      referenceNo: string;
      description?: string;
      note?: string;
      bankAccountId: number;
      status: 'received' | 'pending';
    }) {
      return this.request<ApiResponse<{ id: number }>>('/incomes', {
        method: 'POST',
        body: JSON.stringify(incomeData),
      });
    }

    async updateIncome(id: number, incomeData: {
      title: string;
      type: string;
      amount: number;
      incomeDate: string;
      source: string;
      referenceNo: string;
      description?: string;
      note?: string;
      bankAccountId: number;
      status: 'received' | 'pending';
    }) {
      return this.request<ApiResponse<any>>(`/incomes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(incomeData),
      });
    }

    async deleteIncome(id: number) {
      return this.request<ApiResponse<any>>(`/incomes/${id}`, {
        method: 'DELETE',
      });
    }

    async getIncomeTypes() {
      return this.request<ApiResponse<string[]>>('/incomes/types');
    }


  async getExpenses(params?: {
    page?: number;
    limit?: number;
    category?: string;
    dateFrom?: string;
    dateTo?: string;
    amountMin?: number;
    amountMax?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.set(key, value.toString());
      });
    }
    return this.request<ApiResponse<z.infer<typeof ExpenseSchema>[]>>(`/expenses?${searchParams}`);
  }

  async createExpense(expenseData: {
    amount: number;
    date: string;
    category: string;
    method: string;
    note?: string;
    receiptUrl?: string;
    status?: 'pending' | 'approved' | 'rejected';
  }) {
    return this.request<ApiResponse<z.infer<typeof ExpenseSchema>>>('/expenses', {
      method: 'POST',
      body: JSON.stringify(expenseData),
    });
  }

  async updateExpense(id: string, expenseData: Partial<z.infer<typeof ExpenseSchema>>) {
    return this.request<ApiResponse<z.infer<typeof ExpenseSchema>>>(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(expenseData),
    });
  }

  async deleteExpense(id: string) {
    return this.request<ApiResponse<null>>(`/expenses/${id}`, {
      method: 'DELETE',
    });
  }

  async getExpenseCategories() {
    return this.request<ApiResponse<string[]>>('/expenses/categories');
  }

  // Bank Accounts endpoints
  async getBankAccounts() {
    return this.request<ApiResponse<z.infer<typeof BankAccountSchema>[]>>('/bank-accounts');
  }

  async createBankAccount(accountData: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    openingBalance: number;
  }) {
    return this.request<ApiResponse<z.infer<typeof BankAccountSchema>>>('/bank-accounts', {
      method: 'POST',
      body: JSON.stringify(accountData),
    });
  }

  async updateBankAccount(id: string, accountData: Partial<z.infer<typeof BankAccountSchema>>) {
    return this.request<ApiResponse<z.infer<typeof BankAccountSchema>>>(`/bank-accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(accountData),
    });
  }

  async deleteBankAccount(id: string) {
    return this.request<ApiResponse<null>>(`/bank-accounts/${id}`, {
      method: 'DELETE',
    });
  }

  async depositToBank(id: string, depositData: {
    amount: number;
    date: string;
    note?: string;
    reference?: string;
  }) {
    return this.request<ApiResponse<any>>(`/bank-accounts/${id}/deposit`, {
      method: 'POST',
      body: JSON.stringify(depositData),
    });
  }

  async withdrawFromBank(id: string, withdrawData: {
    amount: number;
    date: string;
    note?: string;
  }) {
    return this.request<ApiResponse<any>>(`/bank-accounts/${id}/withdraw`, {
      method: 'POST',
      body: JSON.stringify(withdrawData),
    });
  }

  async transferBetweenBanks(fromId: string, transferData: {
    toAccountId: string;
    amount: number;
    date: string;
    note?: string;
  }) {
    return this.request<ApiResponse<any>>(`/bank-accounts/${fromId}/transfer`, {
      method: 'POST',
      body: JSON.stringify(transferData),
    });
  }

  async getBankTransactions(id: string, params?: {
    page?: number;
    limit?: number;
    type?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.set(key, value.toString());
      });
    }
    return this.request<ApiResponse<any>>(`/bank-accounts/${id}/transactions?${searchParams}`);
  }
  async getBankStatement(id: string, params?: {
    page?: number;
    limit?: number;
    type?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.set(key, value.toString());
      });
    }
    return this.request<ApiResponse<any>>(`/bank-accounts/${id}/statement?${searchParams}`);
  }

  // Ledger endpoints
  async getLedger(params?: {
    page?: number;
    limit?: number;
    dateFrom?: string;
    dateTo?: string;
    type?: string;
    memberId?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.set(key, value.toString());
      });
    }
    return this.request<ApiResponse<any>>(`/ledger?${searchParams}`);
  }

  async getLedgerSummary(params?: {
    dateFrom?: string;
    dateTo?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.set(key, value.toString());
      });
    }
    return this.request<ApiResponse<any>>(`/ledger/summary?${searchParams}`);
  }

  // Cash Book endpoints
  async getCashBook(params?: {
    page?: number;
    limit?: number;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.set(key, value.toString());
      });
    }
    return this.request<ApiResponse<any>>(`/cashbook?${searchParams}`);
  }

  async getCashBookSummary(params?: {
    dateFrom?: string;
    dateTo?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.set(key, value.toString());
      });
    }
    return this.request<ApiResponse<any>>(`/cashbook/summary?${searchParams}`);
  }

  // Dashboard endpoints
  async getDashboardStats() {
    return this.request<ApiResponse<z.infer<typeof DashboardStatsSchema>>>('/dashboard/stats');
  }

  async getMemberDashboardStats() {
    return this.request<ApiResponse<any>>('/dashboard/member-stats');
  }

  // Roles & Permissions endpoints
  async getRoles() {
    return this.request<ApiResponse<z.infer<typeof RoleSchema>[]>>('/roles');
  }

  async createRole(roleData: {
    name: string;
    description?: string;
    permissions: string[];
  }) {
    return this.request<ApiResponse<z.infer<typeof RoleSchema>>>('/roles', {
      method: 'POST',
      body: JSON.stringify(roleData),
    });
  }

  async updateRole(id: string, roleData: Partial<z.infer<typeof RoleSchema>>) {
    return this.request<ApiResponse<z.infer<typeof RoleSchema>>>(`/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roleData),
    });
  }

  async deleteRole(id: string) {
    return this.request<ApiResponse<null>>(`/roles/${id}`, {
      method: 'DELETE',
    });
  }

  async assignRole(assignmentData: {
    userId: string;
    userName: string;
    roleId: string;
  }) {
    return this.request<ApiResponse<any>>('/roles/assign', {
      method: 'POST',
      body: JSON.stringify(assignmentData),
    });
  }

  async removeRoleAssignment(assignmentData: {
    userId: string;
    roleId: string;
  }) {
    return this.request<ApiResponse<any>>('/roles/assign', {
      method: 'DELETE',
      body: JSON.stringify(assignmentData),
    });
  }

  async getRoleAssignments(params?: {
    userId?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.userId) searchParams.set('userId', params.userId);
    return this.request<ApiResponse<any>>(`/roles/assignments?${searchParams}`);
  }

  async getMyPermissions() {
    return this.request<ApiResponse<any>>('/roles/me/permissions');
  }

  // Approvals endpoints
  async getApprovals(params?: {
    status?: string;
    type?: string;
    createdBy?: string;
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.set(key, value.toString());
      });
    }
    return this.request<ApiResponse<z.infer<typeof ApprovalSchema>[]>>(`/approvals?${searchParams}`);
  }

  async getApproval(id: string) {
    return this.request<ApiResponse<z.infer<typeof ApprovalSchema>>>(`/approvals/${id}`);
  }

  async createApproval(approvalData: {
    type: string;
    title: string;
    amount: number;
    description?: string;
    payload: any;
  }) {
    return this.request<ApiResponse<z.infer<typeof ApprovalSchema>>>('/approvals', {
      method: 'POST',
      body: JSON.stringify(approvalData),
    });
  }

  async approveApproval(id: string) {
    return this.request<ApiResponse<z.infer<typeof ApprovalSchema>>>(`/approvals/${id}/approve`, {
      method: 'PATCH',
    });
  }

  async rejectApproval(id: string, note: string) {
    return this.request<ApiResponse<z.infer<typeof ApprovalSchema>>>(`/approvals/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ note }),
    });
  }

  async getApprovalStats() {
    return this.request<ApiResponse<Record<string, number>>>('/approvals/stats');
  }

  // Reports endpoints
  async getIncomeExpenseReport(params?: {
    dateFrom?: string;
    dateTo?: string;
    groupBy?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.set(key, value.toString());
      });
    }
    return this.request<ApiResponse<any>>(`/reports/income-vs-expense?${searchParams}`);
  }

  async getCashFlowReport(params?: {
    dateFrom?: string;
    dateTo?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.set(key, value.toString());
      });
    }
    return this.request<ApiResponse<any>>(`/reports/cash-flow?${searchParams}`);
  }

  async getMemberDuesReport(params?: {
    status?: string;
    sortBy?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.set(key, value.toString());
      });
    }
    return this.request<ApiResponse<any>>(`/reports/member-dues?${searchParams}`);
  }

  async getBankCashReport() {
    return this.request<ApiResponse<any>>('/reports/bank-vs-cash');
  }

  async getCollectionReport(params?: {
    dateFrom?: string;
    dateTo?: string;
    method?: string;
    status?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.set(key, value.toString());
      });
    }
    return this.request<ApiResponse<any>>(`/reports/collection?${searchParams}`);
  }

  // Global search
  async globalSearch(query: string, limit?: number) {
    const searchParams = new URLSearchParams();
    searchParams.set('q', query);
    if (limit) searchParams.set('limit', limit.toString());
    return this.request<ApiResponse<any>>(`/search?${searchParams}`);
  }

  // FAQ endpoints
  async getFAQs(params?: { category?: string; search?: string }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.set(key, value.toString());
      });
    }
    return this.request<ApiResponse<z.infer<typeof FAQSchema>[]>>(`/faq?${searchParams}`);
  }

  async createFAQ(faqData: { question: string; answer: string; category?: string }) {
    return this.request<ApiResponse<z.infer<typeof FAQSchema>>>('/faq', {
      method: 'POST',
      body: JSON.stringify(faqData),
    });
  }

  async updateFAQ(id: string, faqData: Partial<{ question: string; answer: string }>) {
    return this.request<ApiResponse<z.infer<typeof FAQSchema>>>(`/faq/${id}`, {
      method: 'PUT',
      body: JSON.stringify(faqData),
    });
  }

  async deleteFAQ(id: string) {
    return this.request<ApiResponse<null>>(`/faq/${id}`, {
      method: 'DELETE',
    });
  }

  // Payments endpoints
  async getPayments(params?: {
    page?: number;
    limit?: number;
    status?: string;
    method?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.set(key, value.toString());
      });
    }
    return this.request<ApiResponse<z.infer<typeof PaymentSchema>[]>>(`/payments?${searchParams}`);
  }

  async verifyPayment(id: string, verificationData: { status: string; note?: string }) {
    return this.request<ApiResponse<z.infer<typeof PaymentSchema>>>(`/payments/${id}/verify`, {
      method: 'PATCH',
      body: JSON.stringify(verificationData),
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Error class
export class ApiError extends Error {
  constructor(message: string, public errors: Array<{ field: string; message: string }>) {
    super(message);
    this.name = 'ApiError';
  }
}

// Types
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type User = z.infer<typeof UserSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;
export type CompanySettings = z.infer<typeof CompanySettingsSchema>;
export type Member = z.infer<typeof MemberSchema>;
export type Collection = z.infer<typeof CollectionSchema>;
export type Expense = z.infer<typeof ExpenseSchema>;
export type BankAccount = z.infer<typeof BankAccountSchema>;
export type DashboardStats = z.infer<typeof DashboardStatsSchema>;
export type Role = z.infer<typeof RoleSchema>;
export type Approval = z.infer<typeof ApprovalSchema>;