import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import { useState } from "react";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router-dom";
import { URL_PREFIX } from "../constants";
import { ensureMutationSucceeded, requestGraphQL } from "../utils/graphql";

function ProductCard({ product, isOwner, onDeleted }) {
  const { _id, title, imageUrl, description, price } = product;
  const imagePath = imageUrl?.replaceAll("\\", "/");
  const resolvedImageUrl = imagePath
    ? /^https?:\/\//i.test(imagePath)
      ? imagePath
      : `${URL_PREFIX}/${imagePath.replace(/^\/+/, "")}`
    : null;
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notice, setNotice] = useState(null);

  async function addToCart() {
    setNotice(null);
    setIsAdding(true);
    try {
      const data = await requestGraphQL(
        `mutation { addToCart(productId: ${JSON.stringify(_id)}) { message status } }`,
      );
      const result = data?.addToCart;
      ensureMutationSucceeded(result, "add this product to the cart");
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
      setIsAdding(false);
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
          disabled={isAdding}
          onClick={addToCart}
          variant="contained"
        >
          {isAdding ? "Adding..." : "Add to cart"}
        </Button>
        {isOwner && (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              component={RouterLink}
              to={`/products/${encodeURIComponent(_id)}/edit`}
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