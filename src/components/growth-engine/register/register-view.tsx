"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowRight, Loader2, AlertTriangle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AppHeader, SiteFooter } from "@/components/growth-engine/shared/site-chrome";
import { api } from "@/lib/api";
import { navigate, useHashRoute } from "@/lib/router";
import { useGrowthStore } from "@/lib/store";
import { BRANCHES, YEARS, ACQUISITION_CHANNELS, type StudentDTO } from "@/lib/types";

const formSchema = z.object({
  name: z.string().min(2, "Please enter your full name").max(60),
  email: z.string().email("Enter a valid email address"),
  college: z.string().min(2, "College is required").max(120),
  branch: z.string().min(1, "Select your branch"),
  year: z.string().min(1, "Select your year"),
  channel: z.string().min(1, "Select how you heard about us"),
  refCode: z.string().max(20).optional(),
});
type FormValues = z.infer<typeof formSchema>;

export function RegisterView() {
  const route = useHashRoute();
  const refFromUrl = (route.params.get("ref") ?? "").toUpperCase();
  const setCurrentStudent = useGrowthStore((s) => s.setCurrentStudent);
  const [serverError, setServerError] = useState<string | null>(null);

  // Validate a referral code present in the URL so invalid codes surface early
  const { data: refProfile, isLoading: refLoading } = useQuery({
    queryKey: ["ref-profile", refFromUrl],
    queryFn: () => api.growthProfile(refFromUrl),
    enabled: !!refFromUrl,
    retry: false,
    staleTime: Infinity,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "", email: "", college: "",
      branch: "", year: "",
      channel: refFromUrl ? "Friend Referral" : "",
      refCode: refFromUrl,
    },
  });

  useEffect(() => {
    if (refFromUrl) {
      form.setValue("refCode", refFromUrl);
      if (!form.getValues("channel")) form.setValue("channel", "Friend Referral");
    }
  }, [refFromUrl, form]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      api.register({
        name: values.name,
        email: values.email,
        college: values.college,
        branch: values.branch,
        year: values.year,
        channel: values.channel,
        refCode: values.refCode?.trim() ? values.refCode.trim().toUpperCase() : undefined,
      }),
    onSuccess: ({ student }: { student: StudentDTO }) => {
      setCurrentStudent(student);
      navigate("/success");
    },
    onError: (err: Error & { status?: number }) => {
      setServerError(err.message);
    },
  });

  const refValid = refFromUrl ? !!refProfile && !refLoading : true;
  const referrerFirstName = refProfile?.student.firstName;

  return (
    <div className="relative flex min-h-screen flex-1 flex-col">
      <AppHeader />
      <div className="grid-pattern-light absolute inset-0" aria-hidden />
      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10 sm:px-0 sm:py-14">
        {/* Card */}
        <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-soft sm:p-8">
          <div className="text-center">
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Register for the Workshop
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Fill in your details to reserve your free seat.
            </p>
          </div>

          {serverError ? (
            <Alert variant="destructive" className="mt-5">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Registration problem</AlertTitle>
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          ) : null}

          {refFromUrl && refLoading ? (
            <div className="mt-5 h-12 animate-pulse rounded-lg bg-muted" aria-label="Checking referral code" />
          ) : refFromUrl && !refValid ? (
            <Alert className="mt-5 border-amber-500/40 bg-amber-50 text-amber-800">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertTitle>Referral code not recognized</AlertTitle>
              <AlertDescription>
                &ldquo;{refFromUrl}&rdquo; isn&apos;t a valid code. You can clear it and continue —
                your registration still counts.
              </AlertDescription>
            </Alert>
          ) : referrerFirstName ? (
            <div className="mt-5 rounded-lg border border-emerald-500/30 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              <span className="font-semibold">{referrerFirstName}</span> invited you to this
              workshop — your seat will be linked to their referral.
            </div>
          ) : null}

          <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="mt-6 space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="Enter your full name" autoComplete="name" {...form.register("name")} />
              {form.formState.errors.name ? (
                <p className="text-xs text-red-600">{form.formState.errors.name.message}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="Enter your email address" autoComplete="email" {...form.register("email")} />
              {form.formState.errors.email ? (
                <p className="text-xs text-red-600">{form.formState.errors.email.message}</p>
              ) : null}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="college">College</Label>
                <Input id="college" placeholder="Select or type your college" autoComplete="organization" list="college-options" {...form.register("college")} />
                <datalist id="college-options">
                  <option value="VIT Chennai" />
                  <option value="VIT Vellore" />
                  <option value="SRM Institute of Science & Technology" />
                  <option value="Anna University" />
                  <option value="Amrita Vishwa Vidyapeetham" />
                  <option value="PSG College of Technology" />
                  <option value="CBIT Hyderabad" />
                  <option value="Manipal Institute of Technology" />
                </datalist>
                {form.formState.errors.college ? (
                  <p className="text-xs text-red-600">{form.formState.errors.college.message}</p>
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="branch">Branch</Label>
                <Select value={form.watch("branch")} onValueChange={(v) => form.setValue("branch", v)}>
                  <SelectTrigger id="branch" aria-label="Branch" className="w-full">
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {BRANCHES.map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.branch ? (
                  <p className="text-xs text-red-600">{form.formState.errors.branch.message}</p>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="year">Year</Label>
                <Select value={form.watch("year")} onValueChange={(v) => form.setValue("year", v)}>
                  <SelectTrigger id="year" aria-label="Year" className="w-full">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {YEARS.map((y) => (
                      <SelectItem key={y} value={y}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.year ? (
                  <p className="text-xs text-red-600">{form.formState.errors.year.message}</p>
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="channel">How did you hear about us?</Label>
                <Select value={form.watch("channel")} onValueChange={(v) => form.setValue("channel", v)}>
                  <SelectTrigger id="channel" aria-label="Acquisition channel" className="w-full">
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACQUISITION_CHANNELS.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.channel ? (
                  <p className="text-xs text-red-600">{form.formState.errors.channel.message}</p>
                ) : null}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="refCode">
                Referral Code <span className="font-normal text-muted-foreground">(Optional)</span>
              </Label>
              <Input
                id="refCode"
                placeholder="Enter referral code (e.g. JASWAN123)"
                className="font-mono uppercase"
                {...form.register("refCode")}
              />
              {form.formState.errors.refCode ? (
                <p className="text-xs text-red-600">{form.formState.errors.refCode.message}</p>
              ) : null}
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={mutation.isPending}
              className="h-12 w-full gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-base font-semibold shadow-lg shadow-blue-600/25 hover:from-blue-400 hover:to-indigo-500"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Reserving your seat…
                </>
              ) : (
                <>
                  Register My Seat
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </>
              )}
            </Button>
            <p className="flex items-start justify-center gap-1.5 text-center text-[11px] leading-relaxed text-muted-foreground">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              Demo prototype — registration data is stored locally for this simulation and only
              minimal info (name, email, college) is collected.
            </p>
          </form>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
