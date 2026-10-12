import { useState, useEffect } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import RHFTextField from "../components/RHFTextField";
import { useForm } from "react-hook-form";
import { Link as RouterLink } from "react-router-dom";
import { ensureMutationSucceeded, requestGraphQL } from "../utils/graphql";
import { RESET_DURATION } from "../constants";
import "./Login.css";

const RESET_PASSWORD_MUTATION = `
  mutation PostResetPassword($email: String!) {
    postResetPassword(email: $email) {
      status
      message
    }
  }
`;

function ResetPasswordPage() {
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countDown, setCountDown] = useState(0)
  const [resendCount, setResendCount] = useState(0)
  const { control, handleSubmit } = useForm({
    defaultValues: { email: "" },
    mode: "onBlur",
  });

  const onSubmit = async ({ email }) => {
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const data = await requestGraphQL(RESET_PASSWORD_MUTATION, {
        variables: { email: email.trim() },
      });
      const result = data?.postResetPassword;

      ensureMutationSucceeded(result, "send the password reset email");
      if (
        typeof result?.status === "undefined" ||
        typeof result?.message !== "string" ||
        !result.message.trim() ||
        (typeof result.status === "string" &&
          /^(error|fail(?:ed|ure)?)$/i.test(result.status.trim()))
      ) {
        throw new Error(
          result?.message || "Unable to send the password reset email. Please try again.",
        );
      }

      setSuccessMessage(result.message);
      setCountDown(RESET_DURATION)
      setResendCount(prev => prev + 1)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to send the password reset email. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(()=>{
    if(countDown<= 0) return
    const interval = setInterval(()=> setCountDown(prev => prev -1), 1000)
    return ()=> clearInterval(interval)
  },[countDown])

  return (
    <Box component="main" className="login-page">
      <Paper
        component="section"
        elevation={0}
        className="login-card"
        aria-labelledby="reset-password-title"
      >
        <Stack
          component="div"
          direction="row"
          alignItems="center"
          className="login-brand"
          aria-label="Shop App"
        >
          <Typography component="span">Shop App</Typography>
        </Stack>

        <Box className="login-heading">
          <Typography component="p" className="login-eyebrow">
            ACCOUNT RECOVERY
          </Typography>
          <Typography component="h1" id="reset-password-title">
            Reset your password
          </Typography>
          <Typography component="p" className="login-description">
            Enter your email address and we’ll send you instructions to reset
            your password.
          </Typography>
        </Box>

        <Box
          component="form"
          className="login-form"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          <RHFTextField
            name="email"
            control={control}
            rules={{
              required: "Email is required.",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter a valid email address.",
              },
            }}
            label="Email address"
            type="email"
            autoComplete="email"
            fullWidth
          />

          <Button
            className="login-submit"
            type="submit"
            variant="contained"
            fullWidth
            disabled={isSubmitting || countDown > 0}
          >
            {isSubmitting ? "Sending email..." : "Send email"}
          </Button>
          {
            resendCount ?
            <>
              <Typography component="p" variant="body2" color="text.secondary" aria-live="polite">
                {countDown > 0
                  ? `You can resend the email in ${countDown} seconds.`
                  : "You can resend the email now."}
              </Typography>
              <Typography component="p" variant="body2" color="text.secondary">
                Resend count: {resendCount}
              </Typography>
            </>: null
          }

          {errorMessage && (
            <Alert severity="error" role="alert">
              {errorMessage}
            </Alert>
          )}
          {successMessage && (
            <Alert severity="success" role="status">
              {successMessage}
            </Alert>
          )}
        </Box>

        <Typography component="p" className="login-signup">
          Remembered your password?{" "}
          <Link component={RouterLink} to="/login" underline="none">
            Sign in
          </Link>
        </Typography>
      </Paper>
      <Typography component="p" className="login-footer">
        A better way to shop, every day.
      </Typography>
    </Box>
  );
}

export default ResetPasswordPage;
