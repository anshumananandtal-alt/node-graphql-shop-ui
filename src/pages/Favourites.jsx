import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import ProductCard from "../components/ProductCard";
import { FAVOURITES_QUERY } from "../constants";
import { requestGraphQL } from "../utils/graphql";
import "./Favourites.css";

function Favourites() {
  const [favourites, setFavourites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchFavourites() {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const data = await requestGraphQL(FAVOURITES_QUERY, {
          signal: controller.signal,
        });
        if (!Array.isArray(data?.favourites?.items)) {
          throw new Error("The favourites response did not include a list.");
        }
        setFavourites(data.favourites.items);
      } catch (error) {
        if (!controller.signal.aborted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to load favourites. Please try again.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    fetchFavourites();
    return () => controller.abort();
  }, []);

  return (
    <Box component="main" className="favourites-page">
      <Box className="favourites-shell">
        <Box className="favourites-heading">
          <Typography component="p" className="favourites-eyebrow">
            YOUR PERSONAL COLLECTION
          </Typography>
          <Typography component="h1">Favourites</Typography>
          <Typography component="p" className="favourites-description">
            The products you love, all in one place.
          </Typography>
        </Box>

        {isLoading && (
          <Box className="favourites-message" role="status">
            <CircularProgress size={24} />
            <Typography>Loading favourites...</Typography>
          </Box>
        )}

        {errorMessage && (
          <Alert severity="error" role="alert">
            {errorMessage}
          </Alert>
        )}

        {!isLoading && !errorMessage && favourites.length === 0 && (
          <Box className="favourites-empty">
            <Typography component="h2">Nothing saved just yet</Typography>
            <Typography>
              Add products to your favourites and they&apos;ll show up here.
            </Typography>
          </Box>
        )}

        {!isLoading && !errorMessage && favourites.length > 0 && (
          <Grid container className="favourites-grid" spacing={3}>
            {favourites.map(({ _id, productId }) =>
              productId?._id ? (
                <Grid key={_id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <ProductCard
                    isFavourite
                    onFavouriteRemoved={(productIdToRemove) =>
                      setFavourites((current) =>
                        current.filter(
                          ({ productId: favouriteProduct }) =>
                            favouriteProduct?._id !== productIdToRemove,
                        ),
                      )
                    }
                    product={productId}
                  />
                </Grid>
              ) : null,
            )}
          </Grid>
        )}
      </Box>
    </Box>
  );
}

export default Favourites;
