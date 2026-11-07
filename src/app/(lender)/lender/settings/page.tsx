'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Palette } from 'lucide-react';
import { Button } from '@/components/primitives/button';
import { Input } from '@/components/primitives/input';
import { Switch } from '@/components/primitives/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/primitives/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/primitives/card';
import { useToast } from '@/components/primitives/toast';
import { InstitutionLogo } from '@/components/shared/institution-logo';
import { useInstitutionStore } from '@/store/institution-store';
import { institutionApiService } from '@/lib/api/institution-service';
import {
  institutionSettingsSchema,
  type InstitutionSettingsFormData,
} from '@/lib/validations/institution.schema';
import { Institution, SidebarMode } from '@/types/institution';
import {
  CURRENCY_OPTIONS,
  DEFAULT_INSTITUTION_LOGOS,
  INSTITUTION_BRAND_COLORS,
} from '@/lib/constants/institutions';
import { InstitutionSettingsPreview } from '@/features/institutions/components/institution-settings-preview';
import { SidebarModePicker } from '@/features/institutions/components/sidebar-mode-picker';
import { invalidateAfterInstitutionSettingsUpdated } from '@/lib/utils/query-invalidation';

export default function InstitutionSettingsPage() {
  const queryClient = useQueryClient();
  const currentInstitution = useInstitutionStore((s) => s.currentInstitution);
  const isHydrated = useInstitutionStore((s) => s.isHydrated);
  const updateCurrentInstitution = useInstitutionStore((s) => s.updateCurrentInstitution);
  const { toast, error: toastError } = useToast();
  const [isSaving, setIsSaving] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<InstitutionSettingsFormData>({
    resolver: zodResolver(institutionSettingsSchema),
    defaultValues: {
      name: currentInstitution.name,
      short: currentInstitution.short,
      primary: currentInstitution.primary,
      sidebarMode: currentInstitution.sidebarMode,
      sidebarColor: currentInstitution.sidebarColor || '#1b344f',
      currency: currentInstitution.currency,
      interest: currentInstitution.interest,
      minLoan: currentInstitution.minLoan,
      maxLoan: currentInstitution.maxLoan,
      autoNotify: currentInstitution.autoNotify,
      logo: currentInstitution.logo || '',
    },
  });

  // Replace form defaults when saved settings load or the institution changes
  React.useEffect(() => {
    reset({
      name: currentInstitution.name,
      short: currentInstitution.short,
      primary: currentInstitution.primary,
      sidebarMode: currentInstitution.sidebarMode,
      sidebarColor: currentInstitution.sidebarColor || '#1b344f',
      currency: currentInstitution.currency,
      interest: currentInstitution.interest,
      minLoan: currentInstitution.minLoan,
      maxLoan: currentInstitution.maxLoan,
      autoNotify: currentInstitution.autoNotify,
      logo: currentInstitution.logo || '',
    });
  }, [currentInstitution, isHydrated, reset]);

  const watchedValues = watch();
  const defaultLogo = DEFAULT_INSTITUTION_LOGOS[currentInstitution.id] ?? '';

  const onSubmit = async (data: InstitutionSettingsFormData) => {
    setIsSaving(true);
    try {
      // Saving commits the draft before the shared workspace theme changes
      const updated = await institutionApiService.updateSettings(currentInstitution.id, {
        ...data,
        logo: data.logo?.trim() ?? '',
      });
      updateCurrentInstitution(updated);
      invalidateAfterInstitutionSettingsUpdated(queryClient, currentInstitution.id);
      toast('Settings saved', `${updated.short} updated`, 'success');
    } catch (err) {
      toastError('Save failed', err instanceof Error ? err.message : 'Could not save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSidebarModeChange = (mode: SidebarMode) => {
    setValue('sidebarMode', mode, { shouldDirty: true });
  };

  // Keep draft branding in the preview until the user saves it
  const previewInstitution: Institution = {
    ...currentInstitution,
    name: watchedValues.name?.trim() || currentInstitution.name,
    short: watchedValues.short?.trim() || currentInstitution.short,
    primary: /^#[0-9a-fA-F]{6}$/.test(watchedValues.primary ?? '')
      ? watchedValues.primary
      : currentInstitution.primary,
    sidebarMode: watchedValues.sidebarMode ?? currentInstitution.sidebarMode,
    sidebarColor:
      watchedValues.sidebarColor && /^#[0-9a-fA-F]{6}$/.test(watchedValues.sidebarColor)
        ? watchedValues.sidebarColor
        : currentInstitution.sidebarColor,
    currency: watchedValues.currency ?? currentInstitution.currency,
    interest: Number.isFinite(watchedValues.interest)
      ? watchedValues.interest
      : currentInstitution.interest,
    minLoan: Number.isFinite(watchedValues.minLoan)
      ? watchedValues.minLoan
      : currentInstitution.minLoan,
    maxLoan: Number.isFinite(watchedValues.maxLoan)
      ? watchedValues.maxLoan
      : currentInstitution.maxLoan,
    autoNotify: watchedValues.autoNotify ?? currentInstitution.autoNotify,
    logo: watchedValues.logo ?? currentInstitution.logo,
  };

  return (
    <div className="workspace-page">
      <div className="workspace-heading">
        <div>
          <h1>Institution settings</h1>
          <p>
            <span className="sm:hidden">Branding and policy for {currentInstitution.short}.</span>
            <span className="hidden sm:inline">
              Configure white-label branding, navigation appearance, and credit policies for{' '}
              {currentInstitution.short}.
            </span>
          </p>
        </div>
      </div>

      {isDirty && (
        <Button
          variant="primary"
          onClick={handleSubmit(onSubmit)}
          isLoading={isSaving}
          className="fixed right-4 bottom-4 z-40 shadow-lg sm:right-7 sm:bottom-7"
        >
          <Save className="h-4 w-4" />
          <span>Save changes</span>
        </Button>
      )}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(360px,1fr)]">
        <div className="relative min-w-0 space-y-5">
          <Card>
            <CardHeader className="border-b border-line pb-4">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-brand" />
                <CardTitle>Branding & identity</CardTitle>
              </div>
              <p className="text-xs text-muted-foreground">Identity and core color tokens.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Institution name"
                  error={errors.name?.message}
                  {...register('name')}
                />
                <Input label="Short name" error={errors.short?.message} {...register('short')} />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="settings-logo-url"
                    className="block text-xs font-semibold text-foreground/90"
                  >
                    Logo URL
                  </label>
                  <div className="flex items-center gap-2">
                    {defaultLogo && watchedValues.logo !== defaultLogo && (
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        onClick={() =>
                          setValue('logo', defaultLogo, { shouldDirty: true, shouldValidate: true })
                        }
                        className="text-3xs font-semibold"
                      >
                        Default logo
                      </Button>
                    )}
                    {Boolean(watchedValues.logo?.trim()) && (
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        onClick={() =>
                          setValue('logo', '', { shouldDirty: true, shouldValidate: true })
                        }
                        className="text-3xs font-semibold text-muted-foreground"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <InstitutionLogo
                    logo={previewInstitution.logo}
                    initials={previewInstitution.initials}
                    name={previewInstitution.name}
                    primaryColor={previewInstitution.primary}
                    className="h-10 w-10 rounded-lg text-xs"
                  />
                  <Input
                    id="settings-logo-url"
                    placeholder="/assets/logo-bluehaven.svg or https://..."
                    error={errors.logo?.message}
                    {...register('logo')}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <span className="block text-xs font-semibold text-foreground/90">
                  Primary color
                </span>
                <div className="flex flex-wrap gap-2">
                  {INSTITUTION_BRAND_COLORS.map((color) => (
                    <Button
                      key={color}
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setValue('primary', color, { shouldDirty: true })}
                      className={`h-8 w-8 p-1 ${watchedValues.primary === color ? 'ring-2 ring-brand ring-offset-2' : ''}`}
                      aria-label={`Use ${color}`}
                      aria-pressed={watchedValues.primary === color}
                    >
                      <span
                        className="h-full w-full rounded-sm"
                        style={{ backgroundColor: color }}
                      />
                    </Button>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    id="settings-primary-color"
                    type="color"
                    value={watchedValues.primary}
                    onChange={(e) => setValue('primary', e.target.value, { shouldDirty: true })}
                    aria-label="Primary brand color"
                    className="h-9 w-12 cursor-pointer rounded border border-input p-1"
                  />
                  <Input
                    value={watchedValues.primary}
                    error={errors.primary?.message}
                    {...register('primary')}
                    className="max-w-xs font-mono text-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-line pb-4">
              <CardTitle>Sidebar appearance</CardTitle>
              <p className="text-xs text-muted-foreground">Workspace navigation theme.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <SidebarModePicker
                brandColor={watchedValues.primary}
                customColor={watchedValues.sidebarColor || '#1b344f'}
                value={watchedValues.sidebarMode}
                onChange={handleSidebarModeChange}
              />

              {watchedValues.sidebarMode === 'custom' && (
                <div className="space-y-1.5 border-t pt-2">
                  <label
                    htmlFor="settings-sidebar-color"
                    className="block text-xs font-semibold text-foreground/90"
                  >
                    Custom sidebar color
                  </label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="settings-sidebar-color"
                      type="color"
                      value={watchedValues.sidebarColor}
                      onChange={(e) =>
                        setValue('sidebarColor', e.target.value, { shouldDirty: true })
                      }
                      aria-label="Sidebar color"
                      className="h-9 w-12 cursor-pointer rounded border border-input p-1"
                    />
                    <Input
                      value={watchedValues.sidebarColor}
                      error={errors.sidebarColor?.message}
                      {...register('sidebarColor')}
                      className="max-w-xs font-mono text-xs"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-line pb-4">
              <CardTitle>Lending policy</CardTitle>
              <p className="text-xs text-muted-foreground">Interest rate and loan boundaries.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="relative space-y-1.5">
                  <label
                    htmlFor="settings-currency"
                    className="block text-xs font-semibold text-foreground/90"
                  >
                    Currency
                  </label>
                  <Select
                    value={watchedValues.currency}
                    onValueChange={(value) =>
                      setValue('currency', value as InstitutionSettingsFormData['currency'], {
                        shouldDirty: true,
                      })
                    }
                  >
                    <SelectTrigger id="settings-currency" className="h-9.5 text-xs">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCY_OPTIONS.map((option) => (
                        <SelectItem key={option.code} value={option.code}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Input
                  label="Indicative rate (%)"
                  type="number"
                  step="0.1"
                  error={errors.interest?.message}
                  {...register('interest', { valueAsNumber: true })}
                />

                <Input
                  label="Minimum loan"
                  type="number"
                  error={errors.minLoan?.message}
                  {...register('minLoan', { valueAsNumber: true })}
                />

                <Input
                  label="Maximum loan"
                  type="number"
                  error={errors.maxLoan?.message}
                  {...register('maxLoan', { valueAsNumber: true })}
                />
              </div>

              <div className="relative flex items-center justify-between gap-3 border-t pt-3">
                <div className="min-w-0">
                  <span className="block text-xs font-semibold text-foreground">
                    Automatic borrower notifications
                  </span>
                  <span className="text-3xs text-muted-foreground">
                    Alerts on approval and payment events
                  </span>
                </div>
                <Switch
                  checked={watchedValues.autoNotify}
                  onCheckedChange={(checked) =>
                    setValue('autoNotify', checked, { shouldDirty: true })
                  }
                  aria-label="Automatic borrower notifications"
                />
              </div>
            </CardContent>
          </Card>
        </div>
        <aside className="min-w-0">
          <InstitutionSettingsPreview institution={previewInstitution} />
        </aside>
      </div>
    </div>
  );
}
