import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import OrderItem from "../components/OrderItem";
import { GRAPHQL_ENDPOINT, URL_PREFIX } from "../constants";

const ORDERS_QUERY = `
  query {
    orders {
      message
      orders {
        _id
        products {
          product {
            _id
            title
            description
            imageUrl
            price
          }
          quantity
        }
        user {
          userId
        }
      }
    }
  }
`;

function Orders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [invoiceStates, setInvoiceStates] = useState({});

  async function handleGetInvoice(orderId) {
    setInvoiceStates((states) => ({
      ...states,
      [orderId]: { isLoading: true, error: "" },
    }));

    try {
      const response = await fetch(
        `${URL_PREFIX}/order/${encodeURIComponent(orderId)}`,
        { credentials: "include" },
      );

      if (!response.ok) {
        const responseText = await response.text();
        let message = responseText;

        try {
          const responseData = JSON.parse(responseText);
          message = responseData.message || responseText;
        } catch {
          // Keep the response text when the server did not return JSON.
        }

        throw new Error(
          message || `Invoice request failed (${response.status}).`,
        );
      }

      const invoice = await response.blob();
      if (invoice.size === 0) {
        throw new Error("The invoice response was empty.");
      }

      const objectUrl = URL.createObjectURL(invoice);
      const downloadLink = document.createElement("a");
      downloadLink.href = objectUrl;
      downloadLink.download = `invoice-${orderId}.pdf`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      setInvoiceStates((states) => ({
        ...states,
        [orderId]: { isLoading: false, error: "" },
      }));
    } catch (error) {
      setInvoiceStates((states) => ({
        ...states,
        [orderId]: {
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : "Unable to get the invoice. Please try again.",
        },
      }));
    }
  }

  useEffect(() => {
    const controller = new AbortController();

    async function fetchOrders() {
      try {
        const response = await fetch(GRAPHQL_ENDPOINT, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: ORDERS_QUERY }),
          signal: controller.signal,
        });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(`Orders request failed (${response.status}).`);
        }

        if (result.errors?.length) {
          throw new Error(result.errors.map(({ message }) => message).join(" "));
        }

        if (!Array.isArray(result.data?.orders?.orders)) {
          throw new Error("The orders response did not include an order list.");
        }

        setOrders(result.data.orders.orders);
      } catch (error) {
        if (!controller.signal.aborted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to load orders. Please try again.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    fetchOrders();

    return () => controller.abort();
  }, []);

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
        textAlign: "left",
      }}
    >
      <Box sx={{ margin: "0 auto", maxWidth: 900 }}>
        <Box sx={{ margin: "12px 0 32px" }}>
          <Typography
            component="p"
            sx={{
              color: "#7565bf",
              fontSize: 11,
              fontWeight: 750,
              letterSpacing: "0.14em",
              marginBottom: 1,
            }}
          >
            YOUR SHOPPING HISTORY
          </Typography>
          <Typography
            component="h1"
            sx={{
              color: "#242137",
              fontSize: "clamp(30px, 5vw, 42px)",
              fontWeight: 700,
              letterSpacing: "-1px",
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            Your orders
          </Typography>
          <Typography component="p" sx={{ color: "#777486", marginTop: 1 }}>
            Review the products included in your past orders.
          </Typography>
        </Box>

        {isLoading && (
          <Box
            role="status"
            sx={{
              alignItems: "center",
              backgroundColor: "rgba(255, 255, 255, 0.78)",
              border: "1px solid rgba(230, 226, 241, 0.9)",
              borderRadius: 2,
              color: "#777486",
              display: "flex",
              gap: 2,
              justifyContent: "center",
              minHeight: 180,
            }}
          >
            <CircularProgress size={24} />
            <Typography>Loading orders...</Typography>
          </Box>
        )}

        {errorMessage && (
          <Alert severity="error" role="alert">
            {errorMessage}
          </Alert>
        )}

        {!isLoading && !errorMessage && orders.length === 0 && (
          <Paper
            elevation={0}
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.78)",
              border: "1px solid rgba(230, 226, 241, 0.9)",
              borderRadius: 2,
              color: "#777486",
              padding: 4,
              textAlign: "center",
            }}
          >
            <Typography>You have no orders yet.</Typography>
          </Paper>
        )}

        {!isLoading &&
          !errorMessage &&
          orders.map((order) => (
            <Paper
              key={order._id}
              component="article"
              elevation={0}
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.94)",
                border: "1px solid rgba(230, 226, 241, 0.9)",
                borderRadius: 2,
                boxShadow: "0 12px 34px rgba(48, 38, 91, 0.08)",
                marginBottom: 3,
                padding: { xs: 2, sm: 3 },
              }}
            >
              <Box
                sx={{
                  alignItems: { xs: "flex-start", sm: "center" },
                  borderBottom: "1px solid #eceaf2",
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  justifyContent: "space-between",
                  gap: 1,
                  paddingBottom: 2,
                }}
              >
                <Box
                  sx={{
                    alignItems: "center",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1,
                  }}
                >
                  <Typography
                    component="h2"
                    sx={{
                      color: "#242137",
                      fontSize: 18,
                      fontWeight: 700,
                      margin: 0,
                    }}
                  >
                    Order #{order._id}
                  </Typography>
                  <Button
                    disabled={!order._id || invoiceStates[order._id]?.isLoading}
                    onClick={() => handleGetInvoice(order._id)}
                    size="small"
                    sx={{ textTransform: "none" }}
                    variant="outlined"
                  >
                    {invoiceStates[order._id]?.isLoading
                      ? "Getting invoice..."
                      : "Get Invoice"}
                  </Button>
                </Box>
                {order.user?.userId && (
                  <Typography
                    component="p"
                    sx={{ color: "#777486", fontSize: 13 }}
                  >
                    Customer: {order.user.userId}
                  </Typography>
                )}
              </Box>
              {invoiceStates[order._id]?.error && (
                <Alert severity="error" role="alert" sx={{ mt: 2 }}>
                  {invoiceStates[order._id].error}
                </Alert>
              )}
              <Box sx={{ display: "grid", gap: 2, paddingTop: 2 }}>
                {order.products.map((item, index) => (
                  <OrderItem
                    key={item.product?._id ?? `${order._id}-${index}`}
                    item={item}
                  />
                ))}
              </Box>
              <Typography
                component="p"
                sx={{
                  borderTop: "1px solid #eceaf2",
                  color: "#5948aa",
                  fontSize: 16,
                  fontWeight: 750,
                  marginTop: 2,
                  paddingTop: 2,
                  textAlign: "right",
                }}
              >
                Order total:{" "}
                {order.products
                  .reduce(
                    (total, { product, quantity }) =>
                      total + (product?.price ?? 0) * quantity,
                    0,
                  )
                  .toLocaleString()}
              </Typography>
            </Paper>
          ))}
      </Box>
    </Box>
  );
}

export default Orders;