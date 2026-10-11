import { useEffect, useRef, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Link as RouterLink, useParams } from "react-router-dom";
import { ensureMutationSucceeded, requestGraphQL } from "../utils/graphql";

const POST_ORDER_MUTATION = `
  mutation PostOrder($sessionId: String!) {
    postOrder(sessionId: $sessionId) {
      message
      order {
        products {
          product {
            _id
            title
            description
            imageUrl
            price
          }
        }
        user {
          userId
          name
        }
      }
    }
  }
`;

function CheckoutSuccess() {
  const { sessionId } = useParams();
  const [orderResult, setOrderResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const [paymentNotConfirmed, setPaymentNotConfirmed] = useState(false);
  const lastRequestKey = useRef(null);

  useEffect(() => {
    const requestKey = `${sessionId ?? ""}:${attempt}`;
    if (lastRequestKey.current === requestKey) {
      return;
    }
    lastRequestKey.current = requestKey;

    async function placeOrder() {
      setErrorMessage("");
      setIsSubmitting(true);

      try {
        if (!sessionId) {
          const error = new Error("The checkout session ID is missing.");
          error.code = 402;
          throw error;
        }

        const data = await requestGraphQL(POST_ORDER_MUTATION, {
          variables: { sessionId },
        });
        const result = data?.postOrder;
        ensureMutationSucceeded(result, "confirm your order");

        if (!result.order) {
          throw new Error("The response did not include the confirmed order.");
        }

        setOrderResult(result);
      } catch (error) {
        const code = Number(error?.code);
        const isUnconfirmedPayment =
          code === 402 ||
          error?.message === "Payment has not been completed or confirmed.";

        setPaymentNotConfirmed(isUnconfirmedPayment);
        setErrorMessage(
          isUnconfirmedPayment
            ? "Something went wrong."
            : error instanceof Error
              ? error.message
              : "Unable to confirm your order. Please try again.",
        );
      } finally {
        setIsSubmitting(false);
      }
    }

    placeOrder();
  }, [attempt, sessionId]);

  const products = orderResult?.order?.products ?? [];

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
            CHECKOUT COMPLETE
          </Typography>

          {isSubmitting ? (
            <Stack direction="row" spacing={2} alignItems="center" role="status">
              <CircularProgress size={24} />
              <Typography>Confirming your order...</Typography>
            </Stack>
          ) : errorMessage ? (
            <>
              <Typography component="h1" variant="h4">
                {paymentNotConfirmed ? "Something went wrong" : "Payment received"}
              </Typography>
              <Alert severity="error" role="alert">
                {paymentNotConfirmed
                  ? errorMessage
                  : `We couldn't confirm your order: ${errorMessage}`}
              </Alert>
              {!paymentNotConfirmed && (
                <Button
                  onClick={() => setAttempt((current) => current + 1)}
                  variant="contained"
                >
                  Retry confirmation
                </Button>
              )}
            </>
          ) : (
            <>
              <Typography component="h1" variant="h4">
                Thank you
                {orderResult?.order?.user?.name
                  ? `, ${orderResult.order.user.name}`
                  : ""}
                !
              </Typography>
              <Alert severity="success">
                {orderResult?.message || "Your order has been placed successfully."}
              </Alert>

              {products.length > 0 && (
                <Box component="section" sx={{ width: "100%" }}>
                  <Typography component="h2" variant="h6" sx={{ mb: 1 }}>
                    Order items
                  </Typography>
                  <Stack spacing={1}>
                    {products.map(({ product }, index) => (
                      <Box
                        key={product?._id ?? `order-product-${index}`}
                        sx={{
                          alignItems: "center",
                          borderBottom: "1px solid #eceaf2",
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 2,
                          paddingBottom: 1,
                        }}
                      >
                        <Typography>{product?.title ?? "Product"}</Typography>
                        {typeof product?.price === "number" && (
                          <Typography>{product.price.toLocaleString()}</Typography>
                        )}
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}

              <Button component={RouterLink} to="/orders" variant="contained">
                View your orders
              </Button>
            </>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}

export default CheckoutSuccess;
