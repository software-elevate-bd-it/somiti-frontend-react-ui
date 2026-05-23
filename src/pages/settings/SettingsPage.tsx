import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import HelpModal from '@/components/shared/HelpModal';
import CompanyHeader from '@/components/shared/CompanyHeader';
import { useCompanyStore } from '@/stores/companyStore';
import { toast } from 'sonner';
import { ImProfile } from "react-icons/im";
import { AiFillCloud } from "react-icons/ai";
import { RiSecurePaymentFill } from "react-icons/ri";
import { MdOutlineSaveAlt, MdOutlineSms } from "react-icons/md";
import { MdDynamicFeed } from "react-icons/md";
import { IoPrintOutline } from "react-icons/io5";


const profileSchema = z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().optional() });
const companySchema = z.object({ companyName: z.string().min(2), address: z.string().optional(), phone: z.string().optional(), email: z.string().email().optional().or(z.literal('')) });

export default function SettingsPage() {
  const { t } = useTranslation();
  const { company, updateCompany } = useCompanyStore();
  const profileForm = useForm<z.infer<typeof profileSchema>>({ resolver: zodResolver(profileSchema), defaultValues: { name: 'Rahim Uddin', email: 'rahim@banani.com', password: '' } });
  const companyForm = useForm<z.infer<typeof companySchema>>({ resolver: zodResolver(companySchema), defaultValues: { companyName: company.name, address: company.address, phone: company.phone, email: company.email } });
  const [printConfig, setPrintConfig] = useState({ showLogo: true, showCompanyName: true, showSignature: true, showNotes: true, marginTop: 20, marginBottom: 20 });

  const handleCompanySave = (data: z.infer<typeof companySchema>) => {
    updateCompany({ name: data.companyName, address: data.address || '', phone: data.phone || '', email: data.email || '' });
    toast.success(t('settings.companySaved'));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateCompany({ logo: reader.result as string });
    reader.readAsDataURL(file);
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateCompany({ signature: reader.result as string });
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div><h1 className="text-2xl font-heading font-bold">{t('settings.title')}</h1><p className="text-muted-foreground">{t('settings.subtitle')}</p></div>
        <HelpModal title={t('settings.helpTitle')} description={t('settings.helpDesc')} steps={[t('settings.helpStep1'), t('settings.helpStep2'), t('settings.helpStep3'), t('settings.helpStep4')]} />
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="flex-wrap">
          <TabsTrigger value="profile"><ImProfile  className='mr-2 text-xl text-orange-500'/> {t('settings.profile')}</TabsTrigger>
          <TabsTrigger value="company"><AiFillCloud  className='mr-2 text-xl text-orange-500'/>{t('settings.company')}</TabsTrigger>
          <TabsTrigger value="fees"><MdDynamicFeed  className='mr-2 text-xl text-orange-500'/>{t('settings.feeSetup')}</TabsTrigger>
          <TabsTrigger value="sms"><MdOutlineSms  className='mr-2 text-xl text-orange-500'/>{t('settings.smsConfig')}</TabsTrigger>
          <TabsTrigger value="payment"><RiSecurePaymentFill  className='mr-2 text-xl text-orange-500'/>{t('settings.paymentGateway')}</TabsTrigger>
          <TabsTrigger value="print"><IoPrintOutline  className='mr-2 text-xl text-orange-500'/>{t('settings.printLayout')}</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card><CardHeader><CardTitle className="font-heading">{t('settings.profileSettings')}</CardTitle></CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(() => toast.success(t('settings.profileUpdated')))} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={profileForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>{t('common.name')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={profileForm.control} name="email" render={({ field }) => (<FormItem><FormLabel>{t('common.email')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                  <FormField control={profileForm.control} name="password" render={({ field }) => (<FormItem><FormLabel>{t('settings.newPassword')}</FormLabel><FormControl><Input type="password" placeholder={t('settings.keepCurrent')} {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <div className="space-y-1"><Label>{t('settings.profilePhoto')}</Label><Input type="file" accept="image/*" /></div>
                  <Button type="submit"><MdOutlineSaveAlt className='text-xl'/>{t('common.save')}</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company">
          <Card><CardHeader><CardTitle className="font-heading">{t('settings.companySettings')}</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              {/* Preview */}
              <div className="p-4 border rounded-lg bg-muted/30">
                <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                <CompanyHeader size="sm" />
              </div>

              <Form {...companyForm}>
                <form onSubmit={companyForm.handleSubmit(handleCompanySave)} className="space-y-4">
                  <FormField control={companyForm.control} name="companyName" render={({ field }) => (<FormItem><FormLabel>{t('settings.companyName')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={companyForm.control} name="address" render={({ field }) => (<FormItem><FormLabel>{t('common.address')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={companyForm.control} name="phone" render={({ field }) => (<FormItem><FormLabel>{t('common.phone')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                  <FormField control={companyForm.control} name="email" render={({ field }) => (<FormItem><FormLabel>{t('common.email')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>{t('settings.companyLogo')}</Label>
                      <Input type="file" accept="image/*" onChange={handleLogoUpload} />
                      {company.logo && <img src={company.logo} alt="Logo" className="h-12 mt-1 rounded border" />}
                    </div>
                    <div className="space-y-1">
                      <Label>{t('settings.signatureUpload')}</Label>
                      <Input type="file" accept="image/*" onChange={handleSignatureUpload} />
                      {company.signature && <img src={company.signature} alt="Signature" className="h-12 mt-1 rounded border" />}
                    </div>
                  </div>
                  <Button type="submit">{t('common.save')}</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees">
          <Card><CardHeader><CardTitle className="font-heading">{t('settings.feeConfiguration')}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label>{t('members.monthlyFee')} (৳)</Label><Input type="number" defaultValue={500} /></div>
                <div className="space-y-1"><Label>{t('settings.lateFee')} (৳)</Label><Input type="number" defaultValue={100} /></div>
                <div className="space-y-1"><Label>{t('settings.gracePeriod')}</Label><Input type="number" defaultValue={7} /></div>
              </div>
              <Button onClick={() => toast.success(t('settings.feeSaved'))}>{t('common.save')}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sms">
          <Card><CardHeader><CardTitle className="font-heading">{t('settings.smsApiConfiguration')}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1"><Label>{t('settings.apiProvider')}</Label><Input defaultValue="Bangla SMS" /></div>
              <div className="space-y-1"><Label>{t('settings.apiKey')}</Label><Input type="password" placeholder={t('settings.apiKey')} /></div>
              <div className="space-y-1"><Label>{t('settings.senderId')}</Label><Input defaultValue="SomiteeHQ" /></div>
              <Button onClick={() => toast.success(t('settings.smsSaved'))}>{t('common.save')}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card><CardHeader><CardTitle className="font-heading">{t('settings.paymentGateway')}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1"><Label>{t('settings.storeId')}</Label><Input placeholder="Store ID" /></div>
              <div className="space-y-1"><Label>{t('settings.storePassword')}</Label><Input type="password" placeholder="Store password" /></div>
              <Button onClick={() => toast.success(t('settings.paymentSaved'))}>{t('common.save')}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="print">
          <Card><CardHeader><CardTitle className="font-heading">{t('settings.printLayoutBuilder')}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{t('settings.printLayoutDesc')}</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50"><Label>{t('settings.showLogo')}</Label><Switch checked={printConfig.showLogo} onCheckedChange={v => setPrintConfig({ ...printConfig, showLogo: v })} /></div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50"><Label>{t('settings.showCompanyName')}</Label><Switch checked={printConfig.showCompanyName} onCheckedChange={v => setPrintConfig({ ...printConfig, showCompanyName: v })} /></div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50"><Label>{t('settings.showSignature')}</Label><Switch checked={printConfig.showSignature} onCheckedChange={v => setPrintConfig({ ...printConfig, showSignature: v })} /></div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50"><Label>{t('settings.showNotes')}</Label><Switch checked={printConfig.showNotes} onCheckedChange={v => setPrintConfig({ ...printConfig, showNotes: v })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label>{t('settings.topMargin')}</Label><Input type="number" value={printConfig.marginTop} onChange={e => setPrintConfig({ ...printConfig, marginTop: Number(e.target.value) })} /></div>
                <div className="space-y-1"><Label>{t('settings.bottomMargin')}</Label><Input type="number" value={printConfig.marginBottom} onChange={e => setPrintConfig({ ...printConfig, marginBottom: Number(e.target.value) })} /></div>
              </div>
              <Button onClick={() => toast.success(t('settings.templateSaved'))}>{t('settings.saveTemplate')}</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
