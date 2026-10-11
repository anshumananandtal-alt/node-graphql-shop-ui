import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router-dom";

function CheckoutFail() {
  return (
    <Box
      component="main"
      sx={{
        background:
          "radial-gradient(ellipse at 12% 14%, rgba(202, 190, 255, 0.42), transparent 34%), radial-gradient(ellipse at 90% 88%, rgba(255, 216, 195, 0.48), transparent 30%), #f7f6fb",
        boxSizing: "border-box",
        color: "#242137",
        flex: 1,
        minHeight: "calc(100svh - 72px)",
        padding: { xs: "28px 16px 48px", sm: "48px 24px 64px" },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.94)",
          border: "1px solid rgba(230, 226, 241, 0.9)",
          borderRadius: 2,
          boxShadow: "0 12px 34px rgba(48, 38, 91, 0.08)",
          margin: "24px auto",
          maxWidth: 700,
          padding: { xs: 3, sm: 5 },
        }}
      >
        <Stack spacing={2} alignItems="flex-start">
          <Typography
            component="p"
            sx={{
              color: "#7565bf",
              fontSize: 11,
              fontWeight: 750,
              letterSpacing: "0.14em",
              margin: 0,
            }}
          >
            CHECKOUT NOT COMPLETED
          </Typography>
          <Typography component="h1" variant="h4">
            Payment was unsuccessful
          </Typography>
          <Alert severity="warning">
            Your payment could not be completed. You can return to checkout and
            try again.
          </Alert>
          <Button
            component={RouterLink}
            to="/checkout"
            variant="contained"
          >
            Return to checkout
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default CheckoutFail;
