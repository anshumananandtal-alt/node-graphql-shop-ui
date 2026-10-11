import Box from "@mui/material/Box";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { URL_PREFIX } from "../constants";

function OrderItem({ item }) {
  const { product, quantity } = item;

  const imagePath = product?.imageUrl?.replaceAll("\\", "/");
  const imageUrl = imagePath
    ? /^https?:\/\//i.test(imagePath)
      ? imagePath
      : `${URL_PREFIX}/${imagePath.replace(/^\/+/, "")}`
    : null;
  const lineTotal = product ? product.price * quantity : 0;

  return (
    <Box
      sx={{
        alignItems: { xs: "flex-start", sm: "center" },
        display: "flex",
        gap: 2,
      }}
    >
      {imageUrl ? (
        <CardMedia
          component="img"
          image={imageUrl}
          alt={product?.title ?? "Product"}
          sx={{
            backgroundColor: "#efedf6",
            borderRadius: 1,
            flexShrink: 0,
            height: 88,
            objectFit: "cover",
            width: 88,
          }}
        />
      ) : product ? (
        <Box
          role="img"
          aria-label={`${product.title} image unavailable`}
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
      ) : null}
      <Box sx={{ minWidth: 0 }}>
        {product ? (
          <>
            <Typography
              component="h3"
              sx={{
                color: "#242137",
                fontSize: 16,
                fontWeight: 700,
                margin: "0 0 4px",
              }}
            >
              {product.title}
            </Typography>
            <Typography
              component="p"
              sx={{ color: "#777486", fontSize: 13, lineHeight: 1.5 }}
            >
              {product.description}
            </Typography>
            <Typography
              component="p"
              sx={{ color: "#5948aa", fontSize: 13, marginTop: 0.75 }}
            >
              Quantity: {quantity} · Price: {product.price} · Line total:{" "}
              {lineTotal}
            </Typography>
          </>
        ) : (
          <Typography color="text.secondary">
            This product is no longer available.
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default OrderItem;