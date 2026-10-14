import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router-dom";
import CartItem from "../components/CartItem";
import {
  CART_QUERY,
  CHECKOUT_SESSION_ID_KEY,
  GRAPHQL_ENDPOINT,
} from "../constants";
import { removeFromCart, setCartItems } from "../../reduxStore/reducer/cart";

const CHECKOUT_QUERY = `
  query { 
  checkout{ 
    items { 
      productId{ 
        _id 
        title 
        description 
        imageUrl
        price 
      } 
      quantity
    } 
    sessionId
    url
  }}
`

const DELETE_CART_ITEM_MUTATION = `
  mutation DeleteCartItem($productId: String!) {
    deleteCart(productId: $productId) {
      message
      status
    }
  }
`;

async function postGraphQL(query, signal, variables) {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, ...(variables ? { variables } : {}) }),
    signal,
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(`GraphQL request failed (${response.status}).`);
  }

  if (result.errors?.length) {
    throw new Error(result.errors.map(({ message }) => message).join(" "));
  }

  return result;
}

function Cart({ checkout = false }) {
  const dispatch = useDispatch();
  const items = useSelector((state) => state.cart.items ?? []);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingIds, setDeletingIds] = useState(() => new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionData, setSessionData] = useState({ url: '', id: ''});
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchCart() {
      try {
        const result = await postGraphQL(
          checkout ? CHECKOUT_QUERY : CART_QUERY,
          controller.signal,
        );
        let cartItems;

        if (checkout) {
          const checkoutData = result.data?.checkout;
          const checkoutSessionId = checkoutData?.sessionId;
          const checkoutSessionUrl = checkoutData.url

          if (
            typeof checkoutSessionId !== "string" ||
            checkoutSessionId.length === 0  || !checkoutSessionUrl
          ) {
            throw new Error(
              "The checkout response did not include a session ID.",
            );
          }

          cartItems = checkoutData.items;
          setSessionData({ url: checkoutSessionUrl, id: checkoutSessionId});
          localStorage.setItem(CHECKOUT_SESSION_ID_KEY, checkoutSessionId);
        } else {
          cartItems = result.data?.carts?.items;
        }
        if (!Array.isArray(cartItems)) {
          throw new Error("The cart response did not include a cart item list.");
        }

        dispatch(setCartItems(cartItems));
      } catch (error) {
        if (!controller.signal.aborted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to load your cart. Please try again.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    fetchCart();

    return () => controller.abort();
  }, []);

  async function handleDelete(productId) {
    setErrorMessage("");
    setDeletingIds((currentIds) => new Set(currentIds).add(productId));

    try {
      const result = await postGraphQL(DELETE_CART_ITEM_MUTATION, undefined, {
        productId,
      });
      const deletion = result.data?.deleteCart;

      if (
        !deletion ||
        deletion.status === false ||
        (typeof deletion.status === "number" && deletion.status >= 400) ||
        (typeof deletion.status === "string" &&
          /^(error|failed)$/i.test(deletion.status))
      ) {
        throw new Error(
          deletion?.message || "The cart item could not be removed.",
        );
      }

      dispatch(removeFromCart({ productId }));
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to remove this item. Please try again.",
      );
    } finally {
      setDeletingIds((currentIds) => {
        const nextIds = new Set(currentIds);
        nextIds.delete(productId);
        return nextIds;
      });
    }
  }

  async function handleOrder() {
    setErrorMessage("");
    setIsSubmitting(true);
    try {
      if (!sessionData?.id || !sessionData?.url) {
        throw new Error("The checkout session is not ready. Please try again.");
      }
      window.location.assign(sessionData?.url)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to redirect to payment. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const cartTotal = items.reduce(
    (total, { productId, quantity }) =>
      total + (productId?.price ?? 0) * quantity,
    0,
  );

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
            {checkout ? "ORDER SUMMARY" : "YOUR SHOPPING BAG"}
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
            {checkout ? "Checkout" : "Your cart"}
          </Typography>
          <Typography component="p" sx={{ color: "#777486", marginTop: 1 }}>
            {checkout
              ? "Review your items and place your order."
              : "Review your items before checking out."}
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
            <Typography>Loading cart...</Typography>
          </Box>
        )}

        {errorMessage && (
          <Alert severity="error" role="alert" sx={{ marginBottom: 2 }}>
            {errorMessage}
          </Alert>
        )}

        {!isLoading && !errorMessage && items.length === 0 && (
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
            <Typography>Your cart is empty.</Typography>
            <Button
              component={RouterLink}
              to="/products"
              sx={{ marginTop: 2 }}
              variant="outlined"
            >
              Browse products
            </Button>
          </Paper>
        )}

        {!isLoading && items.length > 0 && (
          <Paper
            component="section"
            elevation={0}
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.94)",
              border: "1px solid rgba(230, 226, 241, 0.9)",
              borderRadius: 2,
              boxShadow: "0 12px 34px rgba(48, 38, 91, 0.08)",
              padding: { xs: 2, sm: 3 },
            }}
          >
            <Box sx={{ display: "grid", gap: 2 }}>
              {items.map((item, index) => (
                <Box
                  key={item.productId?._id ?? `cart-item-${index}`}
                  sx={{
                    borderBottom: "1px solid #eceaf2",
                    paddingBottom: 2,
                  }}
                >
                  <CartItem
                    item={item}
                    isDeleting={deletingIds.has(item.productId?._id)}
                    onDelete={checkout ? undefined : handleDelete}
                  />
                </Box>
              ))}
            </Box>
            <Box
              sx={{
                alignItems: { xs: "stretch", sm: "center" },
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
                justifyContent: "space-between",
                paddingTop: 2,
              }}
            >
              <Typography
                component="p"
                sx={{
                  color: "#5948aa",
                  fontSize: 16,
                  fontWeight: 750,
                  margin: 0,
                }}
              >
                {checkout ? "Order total:" : "Cart total:"}{" "}
                {cartTotal.toLocaleString()}
              </Typography>
              {checkout ? (
                <Button
                  disabled={isSubmitting}
                  onClick={handleOrder}
                  variant="contained"
                >
                  {isSubmitting ? "Redirecting to payment..." : "Pay now"}
                </Button>
              ) : (
                <Button
                  component={RouterLink}
                  to="/checkout"
                  variant="contained"
                >
                  Checkout
                </Button>
              )}
            </Box>
          </Paper>
        )}
      </Box>
    </Box>
  );
}

export default Cart;