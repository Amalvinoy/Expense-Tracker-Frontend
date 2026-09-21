import React from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { AppInput, AppInputProps } from '@/components/common/AppInput';

export interface ControlledInputProps<T extends FieldValues>
  extends Omit<AppInputProps, 'value' | 'onChangeText' | 'error'> {
  name: Path<T>;
  control: Control<T>;
}

export function ControlledInput<T extends FieldValues>({
  name,
  control,
  helperText,
  ...rest
}: ControlledInputProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <AppInput
          value={value ?? ''}
          onChangeText={onChange}
          onBlur={onBlur}
          error={error?.message}
          helperText={!error ? helperText : undefined}
          {...rest}
        />
      )}
    />
  );
}
