import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginSchemaType } from '../schemas/auth.schemas';
import { useAuthStore } from '@/store/auth.store';

export const useLoginForm = () => {
  const { login, isLoading, error, clearError } = useAuthStore();

  const form = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onTouched',
  });

  const onSubmit = form.handleSubmit(async (data: LoginSchemaType) => {
    clearError();
    try {
      await login(data);
    } catch {
      // Error is set in store
    }
  });

  return {
    form,
    onSubmit,
    isLoading,
    error,
    clearError,
  };
};
