import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import CompanyHeader from '@/components/shared/CompanyHeader';
import SignaturePad from '@/components/shared/SignaturePad';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { UserPlus, ArrowRight, ArrowLeft, Save, Eye, Printer } from 'lucide-react';

const registrationSchema = z.object({
  nameBn: z.string().min(2, 'বাংলায় নাম আবশ্যক').max(100),
  nameEn: z.string().min(2, 'Name in English required').max(100),
  shopName: z.string().min(2, 'Shop name required').max(100),
  fatherName: z.string().min(2, 'Father name required').max(100),
  motherName: z.string().min(2, 'Mother name required').max(100),
  mobile: z.string().min(11, 'Valid mobile required').max(15),
  village: z.string().min(1, 'Village required').max(100),
  wardNo: z.string().max(10).optional(),
  union: z.string().max(100).optional(),
  upazila: z.string().max(100).optional(),
  district: z.string().min(1, 'District required').max(100),
  nid: z.string().min(10, 'Valid NID required').max(20),
  dob: z.string().min(1, 'Date of birth required'),
  nationality: z.string().default('বাংলাদেশী'),
  religion: z.string().default('ইসলাম'),
  bloodGroup: z.string().optional(),
  nomineeName: z.string().max(100).optional(),
  nomineeRelation: z.string().max(50).optional(),
  nomineeNid: z.string().max(20).optional(),
});

type RegistrationData = z.infer<typeof registrationSchema>;

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const RELIGIONS = ['ইসলাম', 'হিন্দু', 'বৌদ্ধ', 'খ্রিস্টান', 'অন্যান্য'];

export default function PublicRegistrationPage() {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [profileImg, setProfileImg] = useState<string>('');
  const [nidFront, setNidFront] = useState<string>('');
  const [nidBack, setNidBack] = useState<string>('');
  const [signature, setSignature] = useState<string>('');
  const [memberId] = useState(`MEM-${Date.now().toString(36).toUpperCase()}`);
  const today = new Date().toISOString().split('T')[0];

  const form = useForm<RegistrationData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      nameBn: '', nameEn: '', shopName: '', fatherName: '', motherName: '',
      mobile: '', village: '', wardNo: '', union: '', upazila: '', district: '',
      nid: '', dob: '', nationality: 'বাংলাদেশী', religion: 'ইসলাম',
      bloodGroup: '', nomineeName: '', nomineeRelation: '', nomineeNid: '',
    },
  });

  const watchAll = form.watch();

  // Auto-save draft every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const data = form.getValues();
      localStorage.setItem('memberRegistrationDraft', JSON.stringify(data));
    }, 5000);
    return () => clearInterval(interval);
  }, [form]);

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('memberRegistrationDraft');
    if (draft) {
      try {
        const data = JSON.parse(draft);
        Object.entries(data).forEach(([key, value]) => {
          if (value) form.setValue(key as keyof RegistrationData, value as string);
        });
      } catch {}
    }
  }, [form]);

  const handleImageUpload = useCallback((setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setter(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const saveDraft = () => {
    localStorage.setItem('memberRegistrationDraft', JSON.stringify(form.getValues()));
    toast.success(t('registration.draftSaved'));
  };

  const handleSubmit = (_data: RegistrationData) => {
    localStorage.removeItem('memberRegistrationDraft');
    toast.success(t('memberRequests.applicationSubmitted'));
    form.reset();
    setStep(1);
    setProfileImg('');
    setNidFront('');
    setNidBack('');
    setSignature('');
  };

  const progress = step === 1 ? 50 : 100;

  const step1Fields = ['nameBn', 'nameEn', 'shopName', 'fatherName', 'motherName', 'mobile', 'village', 'district'] as const;
  const canProceed = step1Fields.every(f => form.getValues(f)?.length >= 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Top bar */}
        <div className="flex justify-between items-center mb-4">
          <Badge variant="outline" className="text-xs">{t('registration.memberId')}: {memberId}</Badge>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">{t('registration.date')}: {today}</Badge>
            <LanguageSwitcher />
          </div>
        </div>

        {/* Company Branding */}
        <CompanyHeader size="lg" className="mb-6 p-4 border rounded-xl bg-card" />

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className={step >= 1 ? 'font-bold text-primary' : 'text-muted-foreground'}>
              {t('registration.step1Title')}
            </span>
            <span className={step >= 2 ? 'font-bold text-primary' : 'text-muted-foreground'}>
              {t('registration.step2Title')}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form (2/3) */}
          <div className="lg:col-span-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)}>
                {step === 1 && (
                  <div className="space-y-6">
                    {/* Section 1: Basic Info */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-heading flex items-center gap-2">
                          <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">1</span>
                          {t('registration.basicInfo')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <FormField control={form.control} name="nameBn" render={({ field }) => (
                            <FormItem><FormLabel>{t('registration.nameBn')} *</FormLabel><FormControl><Input placeholder="বাংলায় নাম" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={form.control} name="nameEn" render={({ field }) => (
                            <FormItem><FormLabel>{t('registration.nameEn')} *</FormLabel><FormControl><Input placeholder="Name in English" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                        </div>
                        <FormField control={form.control} name="shopName" render={({ field }) => (
                          <FormItem><FormLabel>{t('members.shopName')} *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <FormField control={form.control} name="fatherName" render={({ field }) => (
                            <FormItem><FormLabel>{t('registration.fatherName')} *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={form.control} name="motherName" render={({ field }) => (
                            <FormItem><FormLabel>{t('registration.motherName')} *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Section 2: Contact Info */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-heading flex items-center gap-2">
                          <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">2</span>
                          {t('registration.contactInfo')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <FormField control={form.control} name="mobile" render={({ field }) => (
                          <FormItem><FormLabel>{t('common.phone')} *</FormLabel><FormControl><Input placeholder="01XXXXXXXXX" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          <FormField control={form.control} name="village" render={({ field }) => (
                            <FormItem><FormLabel>{t('registration.village')} *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={form.control} name="wardNo" render={({ field }) => (
                            <FormItem><FormLabel>{t('registration.wardNo')}</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                          )} />
                          <FormField control={form.control} name="union" render={({ field }) => (
                            <FormItem><FormLabel>{t('registration.union')}</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                          )} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <FormField control={form.control} name="upazila" render={({ field }) => (
                            <FormItem><FormLabel>{t('registration.upazila')}</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                          )} />
                          <FormField control={form.control} name="district" render={({ field }) => (
                            <FormItem><FormLabel>{t('registration.district')} *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                        </div>
                      </CardContent>
                    </Card>

                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={saveDraft}>
                        <Save className="h-4 w-4 mr-2" /> {t('registration.saveDraft')}
                      </Button>
                      <Button type="button" disabled={!canProceed} onClick={() => setStep(2)} className="flex-1">
                        {t('advancedCollection.next')} <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    {/* Section 3: Identification */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-heading flex items-center gap-2">
                          <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">3</span>
                          {t('registration.identification')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <FormField control={form.control} name="nid" render={({ field }) => (
                            <FormItem><FormLabel>{t('members.nid')} *</FormLabel><FormControl><Input placeholder="1234567890" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={form.control} name="dob" render={({ field }) => (
                            <FormItem><FormLabel>{t('registration.dob')} *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          <FormField control={form.control} name="nationality" render={({ field }) => (
                            <FormItem><FormLabel>{t('registration.nationality')}</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                          )} />
                          <FormField control={form.control} name="religion" render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('registration.religion')}</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>{RELIGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                              </Select>
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="bloodGroup" render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('registration.bloodGroup')}</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="—" /></SelectTrigger></FormControl>
                                <SelectContent>{BLOOD_GROUPS.map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}</SelectContent>
                              </Select>
                            </FormItem>
                          )} />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Section 4: Nominee */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-heading flex items-center gap-2">
                          <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">4</span>
                          {t('registration.nomineeInfo')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <FormField control={form.control} name="nomineeName" render={({ field }) => (
                            <FormItem><FormLabel>{t('registration.nomineeName')}</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                          )} />
                          <FormField control={form.control} name="nomineeRelation" render={({ field }) => (
                            <FormItem><FormLabel>{t('registration.nomineeRelation')}</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                          )} />
                          <FormField control={form.control} name="nomineeNid" render={({ field }) => (
                            <FormItem><FormLabel>{t('registration.nomineeNid')}</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                          )} />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Section 5: Uploads */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-heading flex items-center gap-2">
                          <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">5</span>
                          {t('registration.uploads')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>{t('members.profileImage')}</Label>
                            <Input type="file" accept="image/*" onChange={handleImageUpload(setProfileImg)} />
                            {profileImg && <img src={profileImg} alt="Profile" className="h-20 w-20 object-cover rounded-lg border" />}
                          </div>
                          <div className="space-y-2">
                            <Label>{t('registration.nidFront')}</Label>
                            <Input type="file" accept="image/*" onChange={handleImageUpload(setNidFront)} />
                            {nidFront && <img src={nidFront} alt="NID Front" className="h-20 object-cover rounded border" />}
                          </div>
                          <div className="space-y-2">
                            <Label>{t('registration.nidBack')}</Label>
                            <Input type="file" accept="image/*" onChange={handleImageUpload(setNidBack)} />
                            {nidBack && <img src={nidBack} alt="NID Back" className="h-20 object-cover rounded border" />}
                          </div>
                        </div>

                        <Separator />
                        <div>
                          <Label className="mb-2 block">{t('registration.signature')}</Label>
                          <SignaturePad value={signature} onChange={setSignature} />
                        </div>
                      </CardContent>
                    </Card>

                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={() => setStep(1)}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> {t('common.back')}
                      </Button>
                      <Button type="button" variant="outline" onClick={saveDraft}>
                        <Save className="h-4 w-4 mr-2" /> {t('registration.saveDraft')}
                      </Button>
                      <Button type="submit" className="flex-1" disabled={isLoading}>
                        {isLoading ? <Loader className="h-5 w-5 mr-2 text-white" /> : <UserPlus className="h-4 w-4 mr-2" />}
                        {t('memberRequests.submitApplication')}
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </Form>
          </div>

          {/* Live Preview (1/3) */}
          <div className="hidden lg:block">
            <Card className="sticky top-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-heading flex items-center gap-2">
                  <Eye className="h-4 w-4" /> {t('registration.livePreview')}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-3">
                <div className="flex items-center gap-3">
                  {profileImg ? (
                    <img src={profileImg} alt="" className="h-14 w-14 rounded-full object-cover border-2 border-primary" />
                  ) : (
                    <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-lg font-bold">
                      {watchAll.nameBn?.charAt(0) || '?'}
                    </div>
                  )}
                  <div>
                    <p className="font-bold">{watchAll.nameBn || '—'}</p>
                    <p className="text-muted-foreground text-xs">{watchAll.nameEn || '—'}</p>
                    <Badge variant="outline" className="text-[10px] mt-1">{memberId}</Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-1.5">
                  <PreviewRow label={t('members.shopName')} value={watchAll.shopName} />
                  <PreviewRow label={t('registration.fatherName')} value={watchAll.fatherName} />
                  <PreviewRow label={t('registration.motherName')} value={watchAll.motherName} />
                  <PreviewRow label={t('common.phone')} value={watchAll.mobile} />
                  <PreviewRow label={t('common.address')} value={[watchAll.village, watchAll.wardNo && `W-${watchAll.wardNo}`, watchAll.union, watchAll.upazila, watchAll.district].filter(Boolean).join(', ')} />
                </div>

                <Separator />

                <div className="space-y-1.5">
                  <PreviewRow label={t('members.nid')} value={watchAll.nid} />
                  <PreviewRow label={t('registration.dob')} value={watchAll.dob} />
                  <PreviewRow label={t('registration.nationality')} value={watchAll.nationality} />
                  <PreviewRow label={t('registration.religion')} value={watchAll.religion} />
                  <PreviewRow label={t('registration.bloodGroup')} value={watchAll.bloodGroup} />
                </div>

                {(watchAll.nomineeName) && (
                  <>
                    <Separator />
                    <div className="space-y-1.5">
                      <PreviewRow label={t('registration.nomineeName')} value={watchAll.nomineeName} />
                      <PreviewRow label={t('registration.nomineeRelation')} value={watchAll.nomineeRelation} />
                    </div>
                  </>
                )}

                {signature && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">{t('registration.signature')}</p>
                      <img src={signature} alt="Signature" className="h-10 border rounded" />
                    </div>
                  </>
                )}

                <div className="flex gap-1 mt-3">
                  {nidFront && <img src={nidFront} alt="NID" className="h-12 rounded border flex-1 object-cover" />}
                  {nidBack && <img src={nidBack} alt="NID" className="h-12 rounded border flex-1 object-cover" />}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {t('auth.hasAccount')} <Link to="/login" className="text-primary hover:underline">{t('auth.login')}</Link>
        </p>
      </div>
    </div>
  );
}

function PreviewRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground text-xs shrink-0">{label}</span>
      <span className="text-xs font-medium text-right truncate">{value || '—'}</span>
    </div>
  );
}
