import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, ForgotPasswordSchemaType } from '../schemas/auth.schemas';
import { useAuthStore } from '@/store/auth.store';

export const useForgotPasswordForm = () => {
  const { forgotPassword, isLoading, error, clearError } = useAuthStore();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<ForgotPasswordSchemaType>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
    mode: 'onTouched',
  });

  const onSubmit = form.handleSubmit(async (data: ForgotPasswordSchemaType) => {
    clearError();
    setSuccessMessage(null);
    try {
      const result = await forgotPassword(data);
      setSuccessMessage(result.message);
      form.reset();
    } catch {
      // Error is set in store
    }
  });

  return {
    form,
    onSubmit,
    isLoading,
    error,
    successMessage,
    clearError,
    clearSuccess: () => setSuccessMessage(null),
  };
};
