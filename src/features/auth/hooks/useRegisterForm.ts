import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterSchemaType } from '../schemas/auth.schemas';
import { useAuthStore } from '@/store/auth.store';

export const useRegisterForm = () => {
  const { register: registerUser, isLoading, error, clearError } = useAuthStore();

  const form = useForm<RegisterSchemaType>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onTouched',
  });

  const onSubmit = form.handleSubmit(async (data: RegisterSchemaType) => {
    clearError();
    try {
      await registerUser(data);
    } catch {
      // Error is stored in authStore
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
