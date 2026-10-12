import { useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { SIGNUP_MUTATION, GRAPHQL_ENDPOINT } from "../constants";
import { useForm } from "react-hook-form";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import RHFTextField from "../components/RHFTextField";
import { saveSession } from "../utils/session";
import "./Login.css";

function Signup() {
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { control, getValues, handleSubmit } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  });

  const onSubmit = async ({ name, email, password, confirmPassword }) => {
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: SIGNUP_MUTATION,
          variables: { name, email, password, confirmPassword },
        }),
        credentials: 'include',
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(`Signup request failed (${response.status}).`);
      }

      if (result.errors?.length) {
        throw new Error(result.errors.map(({ message }) => message).join(" "));
      }

      const token = result.data?.postSignup?.token;
      if (typeof token !== "string" || token.length === 0) {
        throw new Error("The signup response did not include a token.");
      }
      const userId = result.data?.postSignup?.userId;
      if (typeof userId !== "string" || userId.length === 0) {
        throw new Error("The signup response did not include a user ID.");
      }
      const role = result?.data?.postLogin?.role
      if (typeof role !== "string" || role.length === 0) {
        throw new Error("The login response did not include a role");
      }
      saveSession(token, userId, role);
      navigate("/products", { replace: true });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to create your account. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="main" className="login-page">
      <Paper
        component="section"
        elevation={0}
        className="login-card"
        aria-labelledby="signup-title"
      >
        <Stack
          component="div"
          direction="row"
          alignItems="center"
          className="login-brand"
          aria-label="Northstar"
        >
          <span className="site-header-brand-mark">S</span>
          <Typography component="span">Shop App</Typography>
        </Stack>

        <Box className="login-heading">
          <Typography component="p" className="login-eyebrow">
            GET STARTED
          </Typography>
          <Typography component="h1" id="signup-title">
            Create your account
          </Typography>
          <Typography component="p" className="login-description">
            Enter your details below to sign up.
          </Typography>
        </Box>

        <Box
          component="form"
          className="login-form"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          <RHFTextField
            name="name"
            control={control}
            rules={{
              required: "Name is required.",
              minLength: {
                value: 5,
                message: "Name must be at least 5 characters.",
              },
              pattern: {
                value: /^[A-Za-z]+(?: [A-Za-z]+)?$/,
                message: "Use letters only, with at most one space between names.",
              },
            }}
            label="Name"
            type="text"
            autoComplete="name"
            fullWidth
          />

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

          <RHFTextField
            name="password"
            control={control}
            rules={{
              required: "Password is required.",
              minLength: {
                value: 5,
                message: "Password must be at least 5 characters.",
              },
            }}
            label="Password"
            type="password"
            autoComplete="new-password"
            fullWidth
          />

          <RHFTextField
            name="confirmPassword"
            control={control}
            rules={{
              required: "Please confirm your password.",
              validate: (value) =>
                value === getValues("password") || "Passwords do not match.",
            }}
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            fullWidth
          />

          <Button
            className="login-submit"
            type="submit"
            variant="contained"
            fullWidth
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </Button>

          {errorMessage && (
            <Alert severity="error" role="alert">
              {errorMessage}
            </Alert>
          )}
        </Box>

        <Typography component="p" className="login-signup">
          Already have an account?{" "}
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

export default Signup;