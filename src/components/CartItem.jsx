import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { URL_PREFIX } from "../constants";

function CartItem({ item, isDeleting, onDelete }) {
  const { productId: product, quantity } = item;
  const imagePath = product?.imageUrl?.replaceAll("\\", "/");
  const imageUrl = imagePath
    ? /^https?:\/\//i.test(imagePath)
      ? imagePath
      : `${URL_PREFIX}/${imagePath.replace(/^\/+/, "")}`
    : null;
  const lineTotal = (product?.price ?? 0) * quantity;

  return (
    <Box
      sx={{
        alignItems: { xs: "flex-start", sm: "center" },
        display: "flex",
        gap: 2,
        justifyContent: "space-between",
      }}
    >
      {imageUrl ? (
        <CardMedia
          component="img"
          image={imageUrl}
          alt={product.title}
          sx={{
            backgroundColor: "#efedf6",
            borderRadius: 1,
            flexShrink: 0,
            height: 88,
            objectFit: "cover",
            width: 88,
          }}
        />
      ) : (
        <Box
          role="img"
          aria-label={`${product?.title ?? "Product"} image unavailable`}
          sx={{
            alignItems: "center",
            backgroundColor: "#efedf6",
            borderRadius: 1,
            color: "#777486",
            display: "flex",
            flexShrink: 0,
            fontSize: 11,
            height: 88,
            justifyContent: "center",
            textAlign: "center",
            width: 88,
          }}
        >
          No image
        </Box>
      )}
      <Box sx={{ minWidth: "16.875rem" }}>
        <Typography
          component="h3"
          sx={{
            color: "#242137",
            fontSize: 16,
            fontWeight: 700,
            margin: "0 0 4px",
          }}
        >
          {product?.title ?? "Product unavailable"}
        </Typography>
        <Typography
          component="p"
          sx={{ color: "#777486", fontSize: 13, lineHeight: 1.5 }}
        >
          {product?.description ?? "This product is no longer available."}
        </Typography>
        <Typography
          component="p"
          sx={{ color: "#5948aa", fontSize: 13, marginTop: 0.75 }}
        >
          Quantity: {quantity} · Price: {product?.price ?? "Unavailable"} · Line
          total: {lineTotal.toLocaleString()}
        </Typography>
      </Box>
      {onDelete && (
        <Button
          color="error"
          disabled={isDeleting || !product?._id}
          onClick={() => onDelete(product._id)}
          sx={{ flexShrink: 0 }}
          variant="outlined"
        >
          {isDeleting ? "Removing..." : "Remove"}
        </Button>
      )}
    </Box>
  );
}

export default CartItem;