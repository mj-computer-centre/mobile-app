import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';

import { TextField, type TextFieldProps } from './text-field';

export interface FormTextFieldProps<Values extends FieldValues> extends Omit<
  TextFieldProps,
  'value' | 'onChangeText' | 'onBlur' | 'error'
> {
  control: Control<Values>;
  name: FieldPath<Values>;
}

/** A TextField bound to a react-hook-form field, showing its validation message. */
export function FormTextField<Values extends FieldValues>({
  control,
  name,
  ...props
}: FormTextFieldProps<Values>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <TextField
          {...props}
          value={typeof field.value === 'string' ? field.value : ''}
          onChangeText={field.onChange}
          onBlur={field.onBlur}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}
