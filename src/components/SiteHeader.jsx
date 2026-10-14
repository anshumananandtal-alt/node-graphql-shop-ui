import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useDispatch } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import {
  GRAPHQL_ENDPOINT,
  LOGOUT_MUTATION,
  TOKEN_KEY,
} from "../constants";
import { clearCart } from "../../reduxStore/reducer/cart";
import { clearUser } from "../../reduxStore/reducer/user";
import { clearProducts } from "../../reduxStore/reducer/product";
import { ensureMutationSucceeded } from "../utils/graphql";
import { clearSession } from "../utils/session";
import "./SiteHeader.css";

const navigationItems = [
  { label: "Products", to: "/products" },
  { label: "Favourites", to: "/favourites" },
  { label: "Cart", to: "/cart" },
  { label: "Orders", to: "/orders" },
];

function SiteHeader() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (token) {
      try {
        const response = await fetch(GRAPHQL_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: LOGOUT_MUTATION,
            variables: { token },
          }),
          credentials: "include",
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(`Logout request failed (${response.status}).`);
        }

        if (result.errors?.length) {
          throw new Error(result.errors.map(({ message }) => message).join(" "));
        }
        const logoutResult = result.data?.postLogout;
        if (!logoutResult) {
          throw new Error("The logout response did not include a result.");
        }

        ensureMutationSucceeded(logoutResult, "log out");
        dispatch(clearUser());
        dispatch(clearCart());
        dispatch(clearProducts())
        clearSession();
        navigate("/login", { replace: true });
      } catch (error) {
        console.error(
          "Logout failed:",
          error instanceof Error ? error.message : "Unknown error",
        );
      }
    }
  };

  return (
    <Box component="header" className="site-header">
      <Box className="site-header-inner">
        <Box className="site-header-brand" aria-label="Shop App">
          <span className="site-header-brand-mark">S</span>
          <span>Shop App</span>
        </Box>

        <Box component="nav" className="site-header-nav" aria-label="Main navigation">
          {navigationItems.map(({ label, to, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `site-header-link${isActive ? " is-active" : ""}`
              }
            >
              {label}
            </NavLink>
          ))}
        </Box>

        <Button
          className="site-header-logout"
          onClick={handleLogout}
          variant="outlined"
        >
          Log out
        </Button>
      </Box>
    </Box>
  );
}

export default SiteHeader;
