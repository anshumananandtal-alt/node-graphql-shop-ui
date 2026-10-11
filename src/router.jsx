import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
} from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import RoutePlaceholder from "./components/RoutePlaceholder";
import SiteHeader from "./components/SiteHeader";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import CheckoutFail from "./pages/CheckoutFail.jsx";
import CheckoutSuccess from "./pages/CheckoutSuccess.jsx";
import ProductForm from "./pages/ProductForm.jsx";
import Login from "./pages/Login.jsx";
import Orders from "./pages/Orders.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import ProductListing from "./pages/ProductListing.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import NewPasswordPage from "./pages/NewPasswordPage.jsx";
import Signup from "./pages/Signup.jsx";
import routes from "./route";

const routeElements = routes.map(({ route, type, component }) => {
  const page =
    component === "Login" ? (
      <Login />
    ) : component === "Cart" ? (
      <Cart />
    ) : component === "Checkout" ? (
      <Checkout />
    ) : component === "CheckoutSuccess" ? (
      <CheckoutSuccess />
    ) : component === "CheckoutFail" ? (
      <CheckoutFail />
    ) : component === "ProductListing" ? (
      <ProductListing />
    ) : component === "ProductDetail" ? (
      <ProductDetail />
    ) : component === "AddProduct" ? (
      <ProductForm />
    ) : component === "EditProduct" ? (
      <ProductForm editing />
    ) : component === "Signup" ? (
      <Signup />
    ) : component === "ResetPassword" ? (
      <ResetPasswordPage />
    ) : component === "NewPassword" ? (
      <NewPasswordPage />
    ) : component === "Order" ? (
      <Orders />
    ) : (
      <RoutePlaceholder component={component} />
    );

  switch (type) {
    case "Normal":
      return <Route key={route} path={route} element={page} />;
    case "Private":
      return (
        <Route
          key={route}
          path={route}
          element={<PrivateRoute>{page}</PrivateRoute>}
        />
      );
    case "Protected":
      return (
        <Route
          key={route}
          path={route}
          element={
            <ProtectedRoute>
              <>
                <SiteHeader />
                {page}
              </>
            </ProtectedRoute>
          }
        />
      );
    default:
      throw new Error(`Unknown route type "${type}" for path "${route}".`);
  }
});

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Navigate to="/products" replace />
          </ProtectedRoute>
        }
      />
      {routeElements}
    </>,
  ),
);

export default router;
