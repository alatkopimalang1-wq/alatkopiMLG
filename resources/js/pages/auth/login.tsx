import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import PasskeyVerify from '@/components/passkey-verify';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Masuk Akun — Alat Kopi Malang" />

            <PasskeyVerify />

            {/* Status notification */}
            {status && (
                <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center text-xs font-semibold text-emerald-800 sm:text-sm dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                    {status}
                </div>
            )}

            <div className="space-y-6">
                {/* 1. GOOGLE LOGIN BUTTON (INSTANT ONE-CLICK AUTH) */}
                <div>
                    <a
                        href="/auth/google/redirect"
                        className="hover:bg-sand-50 flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-sand-300 bg-white px-4 py-3 text-sm font-semibold text-brand-950 shadow-xs transition-all hover:shadow-md active:scale-[0.99] dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800"
                    >
                        <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                            />
                        </svg>
                        <span>Lanjutkan dengan Google</span>
                    </a>
                </div>

                {/* DIVIDER */}
                <div className="relative flex items-center justify-center">
                    <div className="w-full border-t border-sand-300 dark:border-neutral-700" />
                    <span className="bg-sand-50 shrink-0 px-3 text-xs font-medium tracking-wider text-muted-foreground uppercase dark:bg-neutral-900">
                        atau masuk dengan email
                    </span>
                    <div className="w-full border-t border-sand-300 dark:border-neutral-700" />
                </div>

                {/* 2. EMAIL & PASSWORD LOGIN FORM */}
                <div>
                    <Form
                        {...store.form()}
                        resetOnSuccess={['password']}
                        className="flex flex-col gap-5"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-5">
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">
                                            Alamat Email
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            required
                                            autoFocus
                                            tabIndex={1}
                                            autoComplete="email"
                                            placeholder="nama@email.com"
                                            className="h-11"
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="grid gap-2">
                                        <div className="flex items-center">
                                            <Label htmlFor="password">
                                                Kata Sandi
                                            </Label>
                                            {canResetPassword && (
                                                <TextLink
                                                    href={request()}
                                                    className="ml-auto text-xs text-brand-700 hover:text-brand-950 dark:text-neutral-400 dark:hover:text-white"
                                                    tabIndex={5}
                                                >
                                                    Lupa kata sandi?
                                                </TextLink>
                                            )}
                                        </div>
                                        <PasswordInput
                                            id="password"
                                            name="password"
                                            required
                                            tabIndex={2}
                                            autoComplete="current-password"
                                            placeholder="••••••••"
                                            className="h-11"
                                        />
                                        <InputError message={errors.password} />
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <Checkbox
                                            id="remember"
                                            name="remember"
                                            tabIndex={3}
                                        />
                                        <Label
                                            htmlFor="remember"
                                            className="cursor-pointer text-xs font-medium"
                                        >
                                            Ingat saya
                                        </Label>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="mt-2 h-11 w-full cursor-pointer bg-brand-800 text-sm font-bold text-white shadow-md transition-all hover:bg-brand-900 active:scale-95"
                                        tabIndex={4}
                                        disabled={processing}
                                        data-test="login-button"
                                    >
                                        {processing && (
                                            <Spinner className="mr-2 h-4 w-4" />
                                        )}
                                        Masuk
                                    </Button>
                                </div>

                                <div className="pt-2 text-center text-xs text-muted-foreground">
                                    Belum punya akun?{' '}
                                    <TextLink
                                        href={register()}
                                        tabIndex={5}
                                        className="font-semibold text-accent-copper hover:underline"
                                    >
                                        Daftar sekarang
                                    </TextLink>
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            </div>
        </>
    );
}

Login.layout = {
    title: 'Masuk ke Akun Anda',
    description:
        'Pilih masuk mudah lewat Akun Google atau email dan kata sandi',
};
