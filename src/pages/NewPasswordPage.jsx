import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useForm } from "react-hook-form";
import { Link as RouterLink, useParams, useNavigate } from "react-router-dom";
import RHFTextField from "../components/RHFTextField";
import { ensureMutationSucceeded, requestGraphQL } from "../utils/graphql";
import "./Login.css";

const USER_ON_TOKEN_QUERY = `
  query UserOnToken($token: String!) {
    user(token: $token) {
      _id
      name
      email
    }
  }
`;

const POST_NEW_PASSWORD_MUTATION = `
  mutation PostNewPassword($password: String!, $token: String!) {
    postNewPassword(password: $password, token: $token) {
      message
      status
    }
  }
`;

function NewPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate()
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { control, getValues, handleSubmit } = useForm({
    defaultValues: { password: "", confirmPassword: "" },
    mode: "onBlur",
  });

  useEffect(() => {
    const controller = new AbortController();

    async function fetchUser() {
      setIsLoading(true);
      setUser(null);
      setErrorMessage("");

      try {
        if (!token) {
          throw new Error("Invalid token");
        }

        const data = await requestGraphQL(USER_ON_TOKEN_QUERY, {
          variables: { token },
          signal: controller.signal,
        });
        const tokenUser = data?.user;

        if (!tokenUser || typeof tokenUser !== "object") {
          throw new Error("Invalid token");
        }

        setUser(tokenUser);
      } catch {
        if (!controller.signal.aborted) {
          setErrorMessage("Invalid token");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    fetchUser();
    return () => controller.abort();
  }, [token]);

  const onSubmit = async ({ password }) => {
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const data = await requestGraphQL(POST_NEW_PASSWORD_MUTATION, {
        variables: { password, token },
      });
      const result = data?.postNewPassword;

      ensureMutationSucceeded(result, "reset the password");
      if (
        typeof result?.status === "undefined" ||
        typeof result?.message !== "string" ||
        !result.message.trim() ||
        (typeof result.status === "string" &&
          /^(error|fail(?:ed|ure)?)$/i.test(result.status.trim()))
      ) {
        throw new Error(
          result?.message || "Unable to reset the password. Please try again.",
        );
      }

      setSuccessMessage(result.message);
      navigate("/login", { replace: true})
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to reset the password. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormDisabled = isLoading || !user || isSubmitting;

  return (
    <Box component="main" className="login-page">
      <Paper
        component="section"
        elevation={0}
        className="login-card"
        aria-labelledby="new-password-title"
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
          <Typography component="h1" id="new-password-title">
            Create a new password
          </Typography>
          <Typography component="p" className="login-description">
            {user
              ? `Reset the password for ${user.email || user.name || "your account"}.`
              : "Choose a new password for your account."}
          </Typography>
        </Box>

        <Box
          component="form"
          className="login-form"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          <RHFTextField
            name="password"
            control={control}
            rules={{ required: "Password is required." }}
            label="Password"
            type="password"
            autoComplete="new-password"
            fullWidth
            disabled={isFormDisabled}
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
            disabled={isFormDisabled}
          />

          <Button
            className="login-submit"
            type="submit"
            variant="contained"
            fullWidth
            disabled={isFormDisabled}
          >
            {isLoading
              ? "Validating link..."
              : isSubmitting
                ? "Resetting password..."
                : "Reset password"}
          </Button>

          {isLoading && (
            <Alert severity="info" role="status">
              Validating your password reset link...
            </Alert>
          )}
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

export default NewPasswordPage;