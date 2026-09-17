import { zodResolver } from '@hookform/resolvers/zod';
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
        </form>
      </Card>
    </div>
  );
}
