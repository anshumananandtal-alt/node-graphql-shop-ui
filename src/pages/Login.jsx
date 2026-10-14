import { useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import RHFTextField from "../components/RHFTextField";
import { GRAPHQL_ENDPOINT, LOGIN_MUTATION } from "../constants";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { setUser } from "../../reduxStore/reducer/user";
import { saveSession } from "../utils/session";
import "./Login.css";

function Login() {
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { control, handleSubmit } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  const onSubmit = async ({ email, password }) => {
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: LOGIN_MUTATION,
          variables: { email, password },
        }),
        credentials: 'include',
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(`Login request failed (${response.status}).`);
      }

      if (result.errors?.length) {
        throw new Error(result.errors.map(({ message }) => message).join(" "));
      }

      const token = result.data?.postLogin?.token;
      if (typeof token !== "string" || token.length === 0) {
        throw new Error("The login response did not include a token.");
      }
      const userId = result.data?.postLogin?.userId;
      if (typeof userId !== "string" || userId.length === 0) {
        throw new Error("The login response did not include a user ID.");
      }
      const role = result?.data?.postLogin?.role
      if (typeof role !== "string" || role.length === 0) {
        throw new Error("The login response did not include a role");
      }
      saveSession(token, userId, role);
      dispatch(setUser({ email, _id: userId, name: "" }));
      navigate("/products", { replace: true });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to sign in. Please try again.",
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
        aria-labelledby="login-title"
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
            WELCOME BACK
          </Typography>
          <Typography component="h1" id="login-title">
            Sign in to your account
          </Typography>
          <Typography component="p" className="login-description">
            Enter your details below to continue.
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
            autoComplete="current-password"
            fullWidth
          />

          <Box className="login-options">
            <Link component={RouterLink} to="/reset-password" underline="none">
              Forgot password?
            </Link>
          </Box>

          <Button
            className="login-submit"
            type="submit"
            variant="contained"
            fullWidth
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>

          {errorMessage && (
            <Alert severity="error" role="alert">
              {errorMessage}
            </Alert>
          )}
        </Box>

        <Typography component="p" className="login-signup">
          Don't have account?{" "}
          <Link component={RouterLink} to="/signup" underline="none">
            Create an account
          </Link>
        </Typography>
      </Paper>
      <Typography component="p" className="login-footer">
        A better way to shop, every day.
      </Typography>
    </Box>
  );
}

export default Login;