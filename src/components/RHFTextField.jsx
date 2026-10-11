import TextField from "@mui/material/TextField";
import { Controller } from "react-hook-form";

const RHFTextField = ({ name, control, rules, ...textFieldProps }) => (
  <Controller
    name={name}
    control={control}
    rules={rules}
    disabled={textFieldProps.disabled}
    render={({ field, fieldState: { error } }) => (
      <TextField
        {...textFieldProps}
        {...field}
        error={Boolean(error) || textFieldProps.error}
        helperText={error?.message ?? textFieldProps.helperText}
      />
    )}
  />
);

export default RHFTextField;