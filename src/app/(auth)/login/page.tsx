'use client';

import * as React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Activity, Building2, Check, Eye, EyeOff, Lock, Mail, Wallet } from 'lucide-react';
import { Button } from '@/components/primitives/button';
import { Input } from '@/components/primitives/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/primitives/select';
import { useToast } from '@/components/primitives/toast';
import { InstitutionLogo } from '@/components/shared/institution-logo';
import { authApiService } from '@/lib/api/auth-service';
import { APP_ROUTES } from '@/lib/constants/routes';
import { cn } from '@/lib/utils/cn';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth.schema';
import { useAuthStore } from '@/store/auth-store';
import { useInstitutionStore } from '@/store/institution-store';

const PORTAL_OPTIONS = [
  {
    value: 'lender' as const,
    title: 'Lender workspace',
    subtitle: 'Underwriting & portfolio',
    icon: Building2,
  },
  {
    value: 'customer' as const,
    title: 'Customer portal',
    subtitle: 'Credit & repayments',
    icon: Wallet,
  },
] as const;

export default function LoginPage() {
  const router = useRouter();
  const { toast, error: toastError } = useToast();
  const setSession = useAuthStore((s) => s.setSession);
  const institutions = useInstitutionStore((s) => s.institutions);
  const currentInstitution = useInstitutionStore((s) => s.currentInstitution);
  const setInstitution = useInstitutionStore((s) => s.setInstitution);

  const [passwordVisible, setPasswordVisible] = React.useState(false);
  const [activeRole, setActiveRole] = React.useState<'lender' | 'customer'>('lender');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      institutionId: currentInstitution.id,
      role: 'lender',
      email: 'demo@10mg.ai',
      password: 'demo12345',
    },
  });

  const selectedInstitutionId = watch('institutionId');

  const handleInstitutionChange = (id: string) => {
    // Preview the selected institution's brand colors right on the sign-in screen
    setValue('institutionId', id);
    setInstitution(id);
  };

  const handleRoleChange = (role: 'lender' | 'customer') => {
    setActiveRole(role);
    setValue('role', role);
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      const session = await authApiService.login({
        email: data.email,
        password: data.password,
        institutionId: data.institutionId,
        role: data.role,
      });

      setSession(session);
      toast('Signed in successfully', `Welcome to ${currentInstitution.short}`, 'success');

      if (session.role === 'customer') {
        router.push(APP_ROUTES.CUSTOMER.OVERVIEW);
      } else {
        router.push(APP_ROUTES.LENDER.OVERVIEW);
      }
    } catch (err) {
      toastError(
        'Authentication Failed',
        err instanceof Error ? err.message : 'Invalid credentials',
      );
      // Reset only on failure so the button stays busy while the workspace route loads
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-dvh w-full bg-card lg:h-dvh lg:grid-cols-[minmax(0,1.04fr)_minmax(440px,0.96fr)] lg:overflow-hidden">
      <section
        className="relative isolate hidden flex-col justify-between overflow-hidden bg-[#123e59] p-12 text-white lg:flex lg:h-dvh xl:p-16"
        aria-label="Healthcare photograph"
      >
        <Image
          src="/assets/healthcare-care.jpg"
          alt="Healthcare provider at work"
          fill
          unoptimized
          quality={100}
          sizes="(min-width: 1024px) 52vw, 100vw"
          className="-z-20 object-cover object-[center_32%] contrast-[1.03] saturate-[0.9]"
          priority
        />
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              'linear-gradient(180deg, rgba(10,35,60,0.42) 0%, rgba(10,35,60,0.10) 25%, rgba(8,31,55,0.46) 57%, rgba(7,30,55,0.92) 100%), linear-gradient(90deg, rgba(13,66,112,0.34), transparent)',
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 inline-flex w-fit items-center gap-2.5 text-[18px] font-bold tracking-[-0.04em] text-white">
          <span className="grid h-8.5 w-8.5 place-items-center rounded-[9px] bg-white text-[#1673ce] shadow-xs">
            <Activity className="h-4.5 w-4.5" />
          </span>
          <span>10mg Credit V2</span>
        </div>

        <div className="relative z-10 max-w-145">
          <div className="mb-6 inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.16em] text-white/85 uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-[#a9e1f7]" aria-hidden="true" />
            <span>Built for healthcare finance</span>
          </div>
          <h1 className="mb-5 text-[clamp(2.65rem,4.3vw,4.35rem)] font-bold leading-[1.07] tracking-[-0.068em] text-white">
            Better access.
            <br />
            Better care.
          </h1>
          <p className="max-w-107.5 text-[15.5px] leading-[1.7] text-white/85">
            A smarter lending experience for the people keeping healthcare moving.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 text-xs font-medium text-white/75">
          <span className="h-px w-6 bg-white/45" aria-hidden="true" />
          <span>Purpose-built for modern lending teams</span>
        </div>
      </section>

      <section className="relative isolate flex min-h-dvh flex-col items-center justify-center overflow-x-hidden overflow-y-auto px-6 py-10 sm:px-12 lg:h-dvh lg:min-h-0 lg:py-8">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(560px circle at 100% 0%, var(--brand-pale), transparent 68%), radial-gradient(480px circle at 0% 100%, rgba(23, 118, 206, 0.045), transparent 65%)',
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -top-64 -right-64 -z-10 h-135 w-135 bg-[url('/assets/auth-quiet-lines.svg')] bg-contain bg-center bg-no-repeat opacity-90"
          aria-hidden="true"
        />
        <svg
          className="pointer-events-none absolute -bottom-16 -left-16 -z-10 h-64 w-80 text-brand opacity-[0.07]"
          viewBox="0 0 320 240"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="80" cy="180" r="76" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="80" cy="180" r="118" stroke="currentColor" strokeWidth="1.2" />
          <circle
            cx="80"
            cy="180"
            r="160"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeDasharray="4 8"
          />
          <path
            d="M12 180h52l14-32 18 60 15-28h78"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <div className="relative w-full max-w-105">
          <div className="mb-7 flex items-center gap-2.5 lg:hidden">
            <span className="grid h-8.5 w-8.5 place-items-center rounded-[9px] bg-brand text-white shadow-xs">
              <Activity className="h-4.5 w-4.5" />
            </span>
            <strong className="text-[17px] font-bold tracking-[-0.04em] text-foreground">
              10mg Credit V2
            </strong>
          </div>

          <div className="mb-7">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand/15 bg-brand-pale/70 py-1 pr-3 pl-1.5 text-3xs font-semibold text-brand">
              <InstitutionLogo
                logo={currentInstitution.logo}
                initials={currentInstitution.initials}
                name={currentInstitution.name}
                primaryColor={currentInstitution.primary}
                className="h-5 w-5 rounded-full text-[9px]"
              />
              <span>{currentInstitution.short} Workspace</span>
            </div>
            <h2 className="text-[30px] font-bold leading-[1.16] tracking-tighter text-foreground">
              Welcome back
            </h2>
            <p className="mt-1.5 text-[14px] text-muted-foreground">
              Sign in to your lending workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4.5">
            <div className="space-y-1.5">
              <label
                htmlFor="auth-institution"
                className="block text-xs font-semibold text-foreground/90"
              >
                Institution
              </label>
              <Select value={selectedInstitutionId} onValueChange={handleInstitutionChange}>
                <SelectTrigger id="auth-institution" className="h-11 w-full">
                  <SelectValue placeholder="Select institution" />
                </SelectTrigger>
                <SelectContent>
                  {institutions.map((inst) => (
                    <SelectItem key={inst.id} value={inst.id}>
                      <span className="inline-flex items-center gap-2.5">
                        <InstitutionLogo
                          logo={inst.logo}
                          initials={inst.initials}
                          name={inst.name}
                          primaryColor={inst.primary}
                          className="h-5.5 w-5.5 text-[10px]"
                        />
                        <span>{inst.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <span className="block text-xs font-semibold text-foreground/90">Portal</span>
              <div
                className="grid grid-cols-2 gap-2.5"
                role="radiogroup"
                aria-label="Workspace type"
              >
                {PORTAL_OPTIONS.map((option) => {
                  const isSelected = activeRole === option.value;
                  const Icon = option.icon;

                  return (
                    <Button
                      key={option.value}
                      type="button"
                      variant="outline"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => handleRoleChange(option.value)}
                      className={cn(
                        'relative flex h-auto flex-col items-start gap-2 rounded-xl border p-3 text-left transition-all duration-150',
                        isSelected
                          ? 'border-brand bg-brand-pale/45 text-foreground shadow-[0_2px_10px_rgba(15,23,42,0.05)] ring-2 ring-brand/15 hover:bg-brand-pale/55'
                          : 'border-line bg-muted/25 text-muted-foreground hover:border-slate-300 hover:bg-muted/50 hover:text-foreground',
                      )}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span
                          className={cn(
                            'flex h-7.5 w-7.5 items-center justify-center rounded-lg transition-colors',
                            isSelected ? 'bg-brand text-white' : 'bg-muted text-muted-foreground',
                          )}
                        >
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <span
                          className={cn(
                            'flex h-4.5 w-4.5 items-center justify-center rounded-full border transition-colors',
                            isSelected
                              ? 'border-brand bg-brand text-white'
                              : 'border-slate-300 bg-white',
                          )}
                          aria-hidden="true"
                        >
                          {isSelected && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                        </span>
                      </div>
                      <div>
                        <strong className="block text-xs font-bold text-foreground">
                          {option.title}
                        </strong>
                        <span className="mt-0.5 block text-[11px] font-medium text-muted-foreground">
                          {option.subtitle}
                        </span>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>

            <Input
              label="Email address"
              type="email"
              autoComplete="username"
              placeholder="name@company.com"
              className="h-11"
              prefixIcon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type={passwordVisible ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              className="h-11"
              prefixIcon={<Lock className="h-4 w-4" />}
              suffixAction={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setPasswordVisible((v) => !v)}
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                >
                  {passwordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              }
              error={errors.password?.message}
              {...register('password')}
            />

            <Button
              type="submit"
              variant="primary"
              className="mt-2 h-11.5 w-full rounded-lg text-[13.5px] font-semibold shadow-xs transition-all hover:-translate-y-0.5"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              <span>Continue to workspace</span>
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-center text-center text-3xs font-medium text-muted-foreground">
            <span>Encrypted session · Authorized institution access</span>
          </div>
        </div>
      </section>
    </div>
  );
}
