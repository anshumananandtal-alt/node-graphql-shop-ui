const routes = [
  {
    route: "/login",
    type: "Private",
    component: "Login",
  },
  {
    route: "/signup",
    type: "Private",
    component: "Signup",
  },
  {
    route: "/reset-password",
    type: "Private",
    component: "ResetPassword",
  },
  {
    route: "/new-password/:token",
    type: "Private",
    component: "NewPassword",
  },
  {
    route: "/products",
    type: "Protected",
    component: "ProductListing",
  },
  {
    route: "/products/:productId",
    type: "Protected",
    component: "ProductDetail",
  },
  {
    route: "/products/add",
    type: "Protected",
    component: "AddProduct",
  },
  {
    route: "/products/:productId/edit",
    type: "Protected",
    component: "EditProduct",
  },
  {
    route: "/cart",
    type: "Protected",
    component: "Cart",
  },
  {
    route: "/checkout",
    type: "Protected",
    component: "Checkout",
  },
  {
    route: "/checkout/success/:sessionId",
    type: "Protected",
    component: "CheckoutSuccess",
  },
  {
    route: "/checkout/fail",
    type: "Protected",
    component: "CheckoutFail",
  },
  {
    route: "/orders",
    type: "Protected",
    component: "Order",
  },
];

export default routes;