import Box from "@mui/material/Box";
import Pagination from "@mui/material/Pagination";

function ProductPagination({ page, totalPages, onChange }) {
  return (
    <Box
      component="nav"
      aria-label="Product pages"
      sx={{ display: "flex", justifyContent: "center", mt: 4 }}
    >
      <Pagination
        count={totalPages}
        page={page}
        onChange={(_event, selectedPage) => onChange(selectedPage)}
        color="primary"
        shape="rounded"
        showFirstButton
        showLastButton
      />
    </Box>
  );
}

export default ProductPagination;
