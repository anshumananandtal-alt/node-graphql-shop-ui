import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CardMedia from "@mui/material/CardMedia";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import {
  Link as RouterLink,
  useNavigate,
  useParams,
} from "react-router-dom";
import { URL_PREFIX } from "../constants";
import { addToCart } from "../../reduxStore/reducer/cart";
import { ensureMutationSucceeded, requestGraphQL } from "../utils/graphql";
import { getSessionRole } from "../utils/session";
import "./ProductDetail.css";

function getProductQuery() {
  return `
    query Product($_id: String!) {
      product(_id: $_id) {
        _id
        title
        imageUrl
        description
        price
      }
    }
  `;
}

function ProductDetail() {
  const { productId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAdmin = getSessionRole() === "admin";
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const imagePath = product?.imageUrl?.replaceAll("\\", "/");
  const imageUrl = imagePath
    ? /^https?:\/\//i.test(imagePath)
      ? imagePath
      : `${URL_PREFIX}/${imagePath.replace(/^\/+/, "")}`
    : null;

  useEffect(() => {
    const controller = new AbortController();

    async function fetchProduct() {
      setIsLoading(true);
      setErrorMessage("");
      setProduct(null);

      try {
        const data = await requestGraphQL(getProductQuery(), {
          signal: controller.signal,
          variables: { _id: productId },
        });

        if (!data?.product) {
          throw new Error("This product could not be found.");
        }

        setProduct(data.product);
      } catch (error) {
        if (!controller.signal.aborted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to load this product. Please try again.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    fetchProduct();

    return () => controller.abort();
  }, [productId]);

  async function handleAddToCart() {
    setNotice("");
    setErrorMessage("");
    setIsAdding(true);
    try {
      const data = await requestGraphQL(
        `mutation { addToCart(productId: ${JSON.stringify(product._id)}) { message status } }`,
      );
      const result = data?.addToCart;
      ensureMutationSucceeded(result, "add this product to the cart");
      dispatch(addToCart(product));
      setNotice(result.message || "Product added to cart.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to add this product to the cart.",
      );
    } finally {
      setIsAdding(false);
    }
  }

  async function handleDeleteProduct() {
    setErrorMessage("");
    setIsDeleting(true);
    try {
      const data = await requestGraphQL(
        `mutation { deleteProduct(_id: ${JSON.stringify(product._id)}) { message status } }`,
      );
      ensureMutationSucceeded(data?.deleteProduct, "delete product");
      navigate("/products", { replace: true });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to delete this product.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Box component="main" className="product-detail-page">
      <Box className="product-detail-shell">
        <Button
          component={RouterLink}
          to="/products"
          className="product-detail-back"
          startIcon={<span aria-hidden="true">←</span>}
        >
          Back to products
        </Button>

        {isLoading && (
          <Box className="product-detail-message" role="status">
            <CircularProgress size={24} />
            <Typography>Loading product...</Typography>
          </Box>
        )}

        {errorMessage && (
          <Box className="product-detail-message product-detail-error">
            <Alert severity="error" role="alert">
              {errorMessage}
            </Alert>
          </Box>
        )}

        {!isLoading && product && (
          <Paper
            component="article"
            elevation={0}
            className="product-detail-card"
            aria-labelledby="product-detail-title"
          >
            <Box className="product-detail-image-wrap">
              {imageUrl ? (
                <CardMedia
                  component="img"
                  className="product-detail-image"
                  image={imageUrl}
                  alt={product.title}
                />
              ) : (
                <Box
                  className="product-detail-image-placeholder"
                  role="img"
                  aria-label={`${product.title} image unavailable`}
                >
                  No image available
                </Box>
              )}
            </Box>

            <Box className="product-detail-content">
              <Typography component="p" className="product-detail-eyebrow">
                SHOP COLLECTION
              </Typography>
              <Typography component="h1" id="product-detail-title">
                {product.title}
              </Typography>
              <Typography component="p" className="product-detail-description">
                {product.description}
              </Typography>
              <Typography component="p" className="product-detail-price">
                Price: {product.price}
              </Typography>
              {notice && (
                <Alert severity="success" role="status" sx={{ mt: 2 }}>
                  {notice}
                </Alert>
              )}
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1.5,
                  marginTop: 3,
                }}
              >
                <Button
                  disabled={isAdding}
                  onClick={handleAddToCart}
                  variant="contained"
                >
                  {isAdding ? "Adding..." : "Add to cart"}
                </Button>
                {isAdmin && (
                  <>
                    <Button
                      component={RouterLink}
                      to={`/products/${encodeURIComponent(product._id)}/edit`}
                      state={{
                        productListingPage:
                          location.state?.productListingPage,
                      }}
                      variant="outlined"
                    >
                      Edit product
                    </Button>
                    <Button
                      color="error"
                      disabled={isDeleting}
                      onClick={handleDeleteProduct}
                      variant="outlined"
                    >
                      {isDeleting ? "Deleting..." : "Delete product"}
                    </Button>
                  </>
                )}
              </Box>
            </Box>
          </Paper>
        )}
      </Box>

      <Typography component="p" className="product-detail-footer">
        A better way to shop, every day.
      </Typography>
    </Box>
  );
}

export default ProductDetail;