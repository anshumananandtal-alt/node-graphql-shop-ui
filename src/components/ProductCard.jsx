import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router-dom";
import "./ProductCard.css";
import {
  ADD_TO_FAVOURITE_MUTATION,
  CART_QUERY,
  DELETE_FAVOURITE_MUTATION,
  URL_PREFIX,
} from "../constants";
import {
  addToCart as addCartItem,
  decreaseQuantity,
  increaseQuantity,
  removeFromCart,
  setCartItems,
} from "../../reduxStore/reducer/cart";
import { ensureMutationSucceeded, requestGraphQL } from "../utils/graphql";

function ProductCard({
  product,
  isAdmin,
  isCartLoading = false,
  productListingPage,
  onDeleted,
  isFavourite = false,
  onFavouriteRemoved,
}) {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items ?? []);
  const { _id, title, imageUrl, description, price } = product;
  const cartItem = cartItems.find(
    (item) =>
      (item?.productId?._id ?? item?.productId)?.toString() === _id?.toString(),
  );
  const quantity = cartItem?.quantity ?? 0;
  const imagePath = imageUrl?.replaceAll("\\", "/");
  const resolvedImageUrl = imagePath
    ? /^https?:\/\//i.test(imagePath)
      ? imagePath
      : `${URL_PREFIX}/${imagePath.replace(/^\/+/, "")}`
    : null;
  const [isUpdatingCart, setIsUpdatingCart] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingFavourite, setIsUpdatingFavourite] = useState(false);
  const [isAddedToFavourites, setIsAddedToFavourites] = useState(isFavourite);
  const [notice, setNotice] = useState(null);

  async function addCartProduct() {
    const data = await requestGraphQL(
      `mutation AddToCart($productId: String!) {
        addToCart(productId: $productId) { message status }
      }`,
      { variables: { productId: _id } },
    );
    const result = data?.addToCart;
    ensureMutationSucceeded(result, "add this product to the cart");
    return result;
  }

  async function updateFavourite() {
    setNotice(null);
    setIsUpdatingFavourite(true);
    try {
      const mutation = isAddedToFavourites
        ? DELETE_FAVOURITE_MUTATION
        : ADD_TO_FAVOURITE_MUTATION;
      const data = await requestGraphQL(mutation, {
        variables: { prodId: _id },
      });
      const result = isAddedToFavourites
        ? data?.deleteFavourite
        : data?.addToFavourite;
      ensureMutationSucceeded(
        result,
        isAddedToFavourites
          ? "remove this product from favourites"
          : "add this product to favourites",
      );

      if (isAddedToFavourites) {
        onFavouriteRemoved?.(_id);
      } else {
        setIsAddedToFavourites(true);
      }
      setNotice({
        severity: "success",
        message:
          result.message ||
          (isAddedToFavourites
            ? "Product removed from favourites."
            : "Product added to favourites."),
      });
    } catch (error) {
      setNotice({
        severity: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to update favourites.",
      });
    } finally {
      setIsUpdatingFavourite(false);
    }
  }

  async function addToCart() {
    setNotice(null);
    setIsUpdatingCart(true);
    try {
      const result = await addCartProduct();
      dispatch(addCartItem(product));
      setNotice({
        severity: "success",
        message: result.message || "Product added to cart.",
      });
    } catch (error) {
      setNotice({
        severity: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to add this product to the cart.",
      });
    } finally {
      setIsUpdatingCart(false);
    }
  }

  async function changeQuantity(direction) {
    setNotice(null);
    setIsUpdatingCart(true);
    try {
      if (direction > 0) {
        await addCartProduct();
        dispatch(increaseQuantity({ productId: _id }));
      } else {
        const data = await requestGraphQL(
          `mutation DeleteCartItem($productId: String!) {
            deleteCart(productId: $productId) { message status }
          }`,
          { variables: { productId: _id } },
        );
        ensureMutationSucceeded(data?.deleteCart, "decrease this product quantity");

        if (quantity > 1) {
          for (let remaining = 1; remaining < quantity; remaining += 1) {
            await addCartProduct();
          }
          dispatch(decreaseQuantity({ productId: _id }));
        } else {
          dispatch(removeFromCart({ productId: _id }));
        }
      }
    } catch (error) {
      let message =
        error instanceof Error
          ? error.message
          : "Unable to update this product quantity.";
      try {
        const data = await requestGraphQL(CART_QUERY);
        dispatch(setCartItems(data.carts.items));
      } catch (refreshError) {
        message += ` ${refreshError instanceof Error ? refreshError.message : "The cart could not be refreshed."}`;
      }
      setNotice({ severity: "error", message });
    } finally {
      setIsUpdatingCart(false);
    }
  }

  async function deleteProduct() {
    setNotice(null);
    setIsDeleting(true);
    try {
      const data = await requestGraphQL(
        `mutation { deleteProduct(_id: ${JSON.stringify(_id)}) { message status } }`,
      );
      const result = data?.deleteProduct;
      ensureMutationSucceeded(result, "delete product");
      onDeleted(_id);
    } catch (error) {
      setNotice({
        severity: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to delete this product.",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Card className="product-card" elevation={0}>
      <CardActionArea
        component={RouterLink}
        to={`/products/${encodeURIComponent(_id)}`}
        state={{ productListingPage }}
        aria-label={`View ${title}`}
      >
        {resolvedImageUrl ? (
          <CardMedia
            component="img"
            height="200"
            image={resolvedImageUrl}
            alt={title}
            sx={{ objectFit: "cover" }}
          />
        ) : (
          <Box
            role="img"
            aria-label={`${title} image unavailable`}
            sx={{
              alignItems: "center",
              bgcolor: "action.hover",
              color: "text.secondary",
              display: "flex",
              height: 200,
              justifyContent: "center",
            }}
          >
            No image available
          </Box>
        )}
        <CardContent>
          <Typography component="h2" variant="h6" gutterBottom>
            {title}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {description}
          </Typography>
          <Typography component="p" fontWeight="bold">
            Price: {price}
          </Typography>
        </CardContent>
      </CardActionArea>
      <Box sx={{ display: "grid", gap: 1, padding: "0 22px 22px" }}>
        <Button
          disabled={isUpdatingFavourite}
          onClick={updateFavourite}
          variant="outlined"
        >
          {isUpdatingFavourite
            ? "Updating..."
            : isAddedToFavourites
              ? "Remove from favourites"
              : "Add to favourites"}
        </Button>
        {quantity > 0 ? (
          <Box sx={{ display: "grid", gap: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: 'center' }}>
              <Button
                aria-label={`Decrease ${title} quantity`}
                disabled={isUpdatingCart || isCartLoading}
                onClick={() => changeQuantity(-1)}
                variant="outlined"
              >
                −
              </Button>
              <Typography
                aria-live="polite"
                sx={{ minWidth: 24, textAlign: "center" }}
              >
                {quantity}
              </Typography>
              <Button
                aria-label={`Increase ${title} quantity`}
                disabled={isUpdatingCart || isCartLoading}
                onClick={() => changeQuantity(1)}
                variant="outlined"
              >
                +
              </Button>
            </Box>
            <Button
              component={RouterLink}
              disabled={isCartLoading}
              fullWidth
              to="/cart"
              variant="contained"
            >
              Go to cart
            </Button>
          </Box>
        ) : (
          <Button
            disabled={isUpdatingCart || isCartLoading}
            onClick={addToCart}
            variant="contained"
          >
            {isUpdatingCart ? "Adding..." : "Add to cart"}
          </Button>
        )}
        {isAdmin && (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              component={RouterLink}
              to={`/products/${encodeURIComponent(_id)}/edit`}
              state={{ productListingPage }}
              fullWidth
              variant="outlined"
            >
              Edit
            </Button>
            <Button
              color="error"
              disabled={isDeleting}
              fullWidth
              onClick={deleteProduct}
              variant="outlined"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </Box>
        )}
        {notice && (
          <Alert severity={notice.severity} role="status">
            {notice.message}
          </Alert>
        )}
      </Box>
    </Card>
  );
}

export default ProductCard;