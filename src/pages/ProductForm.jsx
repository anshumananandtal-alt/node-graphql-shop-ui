import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import {
  Link as RouterLink,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { URL_PREFIX } from "../constants";
import { ensureMutationSucceeded, requestGraphQL } from "../utils/graphql";
import { getSessionUserId, getSessionRole } from "../utils/session";

const PRODUCT_QUERY = `
  query Product($_id: String!) {
    product(_id: $_id) {
      _id
      title
      description
      imageUrl
      price
      userId {
        _id
        name
      }
    }
  }
`;

const initialValues = {
  title: "",
  description: "",
  imageUrl: "",
  price: "",
};

function graphQLString(value) {
  return JSON.stringify(value);
}

function ProductForm({ editing = false }) {
  const { productId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const currentUserId = getSessionUserId();
    const isAdmin = getSessionRole() === "admin";
  const [values, setValues] = useState(initialValues);
  const [imageFile, setImageFile] = useState(null);
  const [isLoading, setIsLoading] = useState(editing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isAdmin || !editing) {
      return undefined;
    }

    const controller = new AbortController();

    async function loadProduct() {
      try {
        const data = await requestGraphQL(PRODUCT_QUERY, {
          signal: controller.signal,
          variables: { _id: productId },
        });
        const product = data?.product;

        if (!product) {
          throw new Error("This product could not be found.");
        }
        const ownerId =
          product.userId?._id ??
          product.user?.userId ??
          product.userId ??
          "";
        if (String(ownerId) !== String(currentUserId ?? "")) {
          throw new Error("You can only edit products you created.");
        }

        setValues({
          title: product.title ?? "",
          description: product.description ?? "",
          imageUrl: product.imageUrl ?? "",
          price: String(product.price ?? ""),
        });
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

    loadProduct();
    return () => controller.abort();
  }, [currentUserId, editing, isAdmin, productId]);

  function updateField(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  }

  function updateImage(event) {
    setImageFile(event.target.files?.[0] ?? null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      if (!values.title.trim() || !values.description.trim()) {
        throw new Error("Enter a title and description.");
      }

      const price = Number(values.price);
      if (!Number.isFinite(price) || price < 0) {
        throw new Error("Enter a valid non-negative price.");
      }

      if (!imageFile && !values.imageUrl) {
        throw new Error("Choose an image for this product.");
      }

      let imageUrl = values.imageUrl.trim();
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);
      if (editing) {
        formData.append("imageUrl", values.imageUrl);
      }
        const imageResponse = await fetch(`${URL_PREFIX}/post-image`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });
        let imageResult;
        try {
          imageResult = await imageResponse.json();
        } catch {
          throw new Error(
            imageResponse.ok
              ? "The image upload response was invalid."
              : `Image upload failed (${imageResponse.status}).`,
          );
        }
        if (!imageResponse.ok) {
          throw new Error(
            imageResult?.message ||
              `Image upload failed (${imageResponse.status}).`,
          );
        }
        if (
          typeof imageResult?.imageUrl !== "string" ||
          !imageResult.imageUrl.trim()
        ) {
          throw new Error(
            "The image upload response did not include an image URL.",
          );
        }
        imageUrl = imageResult.imageUrl.trim();
      }

      const userInput = `{
        title: ${graphQLString(values.title.trim())}
        description: ${graphQLString(values.description.trim())}
        imageUrl: ${graphQLString(imageUrl)}
        price: ${price}
      }`;
      const operation = editing
        ? `editProduct(prodId: ${graphQLString(productId)}, userInput: ${userInput}) {
            message
            product { _id }
          }`
        : `addProduct(userInput: ${userInput}) {
            message
            product { _id }
          }`;
      const data = await requestGraphQL(`mutation { ${operation} }`);
      const result = editing ? data?.editProduct : data?.addProduct;
      ensureMutationSucceeded(result, editing ? "edit product" : "add product");

      if (!result.product?._id) {
        throw new Error("The product response did not include the saved product.");
      }

      navigate("/products", {
        replace: true,
        state: {
          productListingPage: location.state?.productListingPage,
        },
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to save this product. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isAdmin) {
    return <Navigate to="/products" replace />;
  }

  return (
    <Box
      component="main"
      sx={{
        background:
          "radial-gradient(ellipse at 12% 14%, rgba(202, 190, 255, 0.42), transparent 34%), radial-gradient(ellipse at 90% 88%, rgba(255, 216, 195, 0.48), transparent 30%), #f7f6fb",
        boxSizing: "border-box",
        flex: 1,
        minHeight: "calc(100svh - 72px)",
        padding: { xs: "28px 16px 48px", sm: "48px 24px 64px" },
      }}
    >
      <Box sx={{ margin: "0 auto", maxWidth: 680 }}>
        <Button component={RouterLink} to="/products" sx={{ marginBottom: 2 }}>
          Back to products
        </Button>
        <Paper
          component="section"
          elevation={0}
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.94)",
            border: "1px solid rgba(230, 226, 241, 0.9)",
            borderRadius: 2,
            boxShadow: "0 12px 34px rgba(48, 38, 91, 0.08)",
            padding: { xs: 2, sm: 4 },
          }}
        >
          <Typography
            component="h1"
            sx={{ color: "#242137", fontSize: 28, fontWeight: 700, mb: 3 }}
          >
            {editing ? "Edit product" : "Add a product"}
          </Typography>

          {isLoading && (
            <Box role="status" sx={{ alignItems: "center", display: "flex", gap: 2 }}>
              <CircularProgress size={24} />
              <Typography>Loading product...</Typography>
            </Box>
          )}

          {errorMessage && (
            <Alert severity="error" role="alert" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          {!isLoading && (!editing || !errorMessage) && (
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ display: "grid", gap: 2 }}
            >
              <TextField
                required
                label="Title"
                name="title"
                onChange={updateField}
                value={values.title}
              />
              <TextField
                required
                label="Description"
                name="description"
                multiline
                minRows={3}
                onChange={updateField}
                value={values.description}
              />
              <Box>
                <Button
                  component="label"
                  variant="outlined"
                  sx={{ textTransform: "none" }}
                >
                  {imageFile ? "Choose a different image" : "Upload image"}
                  <input
                    accept="image/*"
                    hidden
                    onChange={updateImage}
                    type="file"
                  />
                </Button>
                <Typography color="text.secondary" sx={{ mt: 1 }} variant="body2">
                  {imageFile
                    ? imageFile.name
                    : editing && values.imageUrl
                      ? "The current image will be kept unless you upload a replacement."
                      : "Choose an image file."}
                </Typography>
              </Box>
              <TextField
                required
                label="Price"
                name="price"
                type="number"
                inputProps={{ min: 0, step: "any" }}
                onChange={updateField}
                value={values.price}
              />
              <Button
                disabled={isSubmitting}
                type="submit"
                variant="contained"
              >
                {isSubmitting
                  ? "Saving..."
                  : editing
                    ? "Save changes"
                    : "Add product"}
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
}

export default ProductForm;
