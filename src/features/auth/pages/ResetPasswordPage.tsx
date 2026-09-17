import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAuth } from '@/app/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { supabase } from '@/lib/supabase';

const schema = z
  .object({
    password: z.string().min(6, 'A senha precisa ter pelo menos 6 caracteres.'),
    confirmPassword: z.string().min(1, 'Confirme a nova senha.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const { updatePassword } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setReady(true);
      } else {
        setInvalid(true);
      }
    });
  }, []);

  const onSubmit = async (data: FormData) => {
    const { error } = await updatePassword(data.password);
    if (error) {
      setError('root', { message: error });
      return;
    }
    showToast('Senha atualizada com sucesso.', 'success');
    navigate('/painel', { replace: true });
  };

  return (
    <div className="flex min-h-svh items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <Card className="w-full max-w-sm">
        <h1 className="mb-1 text-xl font-semibold text-primary dark:text-primary-200">
          Definir nova senha
        </h1>

        {invalid && (
          <p className="mt-4 text-sm text-status-atrasado">
            Este link de redefinição é inválido ou expirou. Solicite um novo link na tela de
            login.
          </p>
        )}

        {ready && !invalid && (
          <form className="mt-4 flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Input
              label="Nova senha"
              type="password"
              autoComplete="new-password"
              error={errors.password?.message}
              {...register('password')}
            />
            <Input
              label="Confirmar nova senha"
              type="password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
            {errors.root && (
              <p role="alert" className="text-sm text-status-atrasado">
                {errors.root.message}
              </p>
            )}
            <Button type="submit" isLoading={isSubmitting} className="w-full">
              Salvar nova senha
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
