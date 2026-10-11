import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import ProductPagination from "../components/ProductPagination";
import { GRAPHQL_ENDPOINT } from "../constants";
import { getSessionUserId } from "../utils/session";
import "./ProductListing.css";

const PRODUCTS_QUERY = `
  query Products($page: Int!) {
    products(page: $page) {
      products{
        _id
        title
        imageUrl
        description
        price
        userId{
          _id
          name
        }
      }
      totalPages
    }
  }
`;

function ProductListing() {
  const currentUserId = getSessionUserId();
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchProducts() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await fetch(GRAPHQL_ENDPOINT, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: PRODUCTS_QUERY,
            variables: { page },
          }),
          signal: controller.signal,
        });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(`Product request failed (${response.status}).`);
        }

        if (result.errors?.length) {
          throw new Error(result.errors.map(({ message }) => message).join(" "));
        }

        if (!Array.isArray(result.data?.products?.products)) {
          throw new Error("The product response did not include a product list.");
        }
        if (
          !Number.isInteger(result.data?.products?.totalPages) ||
          result.data?.priducts?.totalPages < 0
        ) {
          throw new Error(
            "The product response did not include a valid total page count.",
          );
        }

        setProducts(result.data.products?.products);
        setTotalPages(result.data?.products?.totalPages);
      } catch (error) {
        if (error.name !== "AbortError") {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to load products. Please try again.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    fetchProducts();
    return () => controller.abort();
  }, [page]);

  return (
    <Box component="main" className="product-listing-page">
      <Box className="product-listing-shell">
        <Box className="product-listing-heading">
          <Box className="product-listing-heading-content">
            <Box>
              <Typography component="p" className="product-listing-eyebrow">
                THE SHOP COLLECTION
              </Typography>
              <Typography component="h1">Find your next favorite</Typography>
              <Typography component="p" className="product-listing-description">
                Thoughtfully selected products for the things you love.
              </Typography>
            </Box>
            <Button
              component={RouterLink}
              to="/products/add"
              className="product-listing-add-button"
              variant="contained"
            >
              Add product
            </Button>
          </Box>
        </Box>

        {isLoading && (
          <Box className="product-listing-message" role="status">
            <CircularProgress size={24} />
            <Typography>Loading products...</Typography>
          </Box>
        )}

        {errorMessage && (
          <Alert className="product-listing-alert" severity="error" role="alert">
            {errorMessage}
          </Alert>
        )}

        {!isLoading && !errorMessage && products.length === 0 && (
          <Box className="product-listing-message">
            <Typography>No products are available yet.</Typography>
          </Box>
        )}

        {!isLoading && !errorMessage && products.length > 0 && (
          <Grid container className="product-listing-grid" spacing={3}>
            {products.map((product) => (
              <Grid key={product._id} size={{ xs: 12, sm: 6, md: 4 }}>
                <ProductCard
                  product={product}
                  isOwner={
                    String(product.userId?._id ?? "") ===
                    String(currentUserId ?? "")
                  }
                  onDeleted={(deletedId) =>
                    setProducts((currentProducts) =>
                      currentProducts.filter((item) => item._id !== deletedId),
                    )
                  }
                />
              </Grid>
            ))}
          </Grid>
        )}

        {!isLoading && !errorMessage && totalPages > 1 && (
          <ProductPagination
            page={page}
            totalPages={totalPages}
            onChange={setPage}
          />
        )}
      </Box>
      <Typography component="p" className="product-listing-footer">
        A better way to shop, every day.
      </Typography>
    </Box>
  );
}

export default ProductListing;