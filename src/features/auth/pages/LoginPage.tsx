import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAuth } from '@/app/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

const loginSchema = z.object({
  email: z.string().min(1, 'Informe o e-mail.').email('Informe um e-mail válido.'),
  password: z.string().min(1, 'Informe a senha.'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { signIn, session, loading: authLoading } = useAuth();
  const [showReset, setShowReset] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  if (!authLoading && session) {
    return <Navigate to="/painel" replace />;
  }

  const onSubmit = async (data: LoginFormData) => {
    const { error } = await signIn(data.email, data.password);
    if (error) {
      setError('root', { message: error });
    }
  };

  return (
    <div className="flex min-h-svh items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <Card className="w-full max-w-sm">
        <h1 className="mb-1 text-xl font-semibold text-primary dark:text-primary-200">
          Acro Gestão
        </h1>
        {showReset ? (
          <ResetRequestForm onBack={() => setShowReset(false)} />
        ) : (
          <>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              Entre com seu e-mail e senha.
            </p>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
              <Input
                label="E-mail"
                type="email"
                autoComplete="email"
                error={errors.email?.message}
                {...register('email')}
              />
              <Input
                label="Senha"
                type="password"
                autoComplete="current-password"
                error={errors.password?.message}
                {...register('password')}
              />
              {errors.root && (
                <p role="alert" className="text-sm text-status-atrasado">
                  {errors.root.message}
                </p>
              )}
              <Button type="submit" isLoading={isSubmitting} className="w-full">
                Entrar
              </Button>
              <button
                type="button"
                onClick={() => setShowReset(true)}
                className="min-h-touch text-sm text-primary underline-offset-2 hover:underline dark:text-primary-200"
              >
                Esqueci minha senha
              </button>
            </form>
          </>
        )}
      </Card>
    </div>
  );
}

const resetSchema = z.object({
  email: z.string().min(1, 'Informe o e-mail.').email('Informe um e-mail válido.'),
});

type ResetFormData = z.infer<typeof resetSchema>;

function ResetRequestForm({ onBack }: { onBack: () => void }) {
  const { requestPasswordReset } = useAuth();
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormData>({ resolver: zodResolver(resetSchema) });

  if (sent) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Se esse e-mail estiver cadastrado, enviamos um link para redefinir a senha. Abra o link
          no mesmo dispositivo em que você está usando o app.
        </p>
        <Button type="button" variant="secondary" onClick={onBack} className="w-full">
          Voltar para o login
        </Button>
      </div>
    );
  }

  const onSubmit = async (data: ResetFormData) => {
    const { error } = await requestPasswordReset(data.email);
    if (error) {
      setError('root', { message: error });
      return;
    }
    setSent(true);
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Informe o e-mail da sua conta para receber um link de redefinição de senha.
      </p>
      <Input
        label="E-mail"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
      {errors.root && (
        <p role="alert" className="text-sm text-status-atrasado">
          {errors.root.message}
        </p>
      )}
      <Button type="submit" isLoading={isSubmitting} className="w-full">
        Enviar link de redefinição
      </Button>
      <button
        type="button"
        onClick={onBack}
        className="min-h-touch text-sm text-gray-500 underline-offset-2 hover:underline dark:text-gray-400"
      >
        Voltar para o login
      </button>
    </form>
  );
}
