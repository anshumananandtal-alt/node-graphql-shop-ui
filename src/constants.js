export const GRAPHQL_ENDPOINT = "http://localhost:3000/graphql";
export const LOGIN_MUTATION = `
  mutation PostLogin($email: String!, $password: String!) {
    postLogin(email: $email, password: $password) {
      token
      userId
    }
  }
`;
export const SIGNUP_MUTATION = `
  mutation PostSignup(
    $name: String!
    $email: String!
    $password: String!
    $confirmPassword: String!
  ) {
    postSignup(
      name: $name
      email: $email
      password: $password
      confirmPassword: $confirmPassword
    ) {
      token
      userId
    }
  }
`;
export const LOGOUT_MUTATION = `
  mutation PostLogout($token: String!) {
    postLogout(token: $token) {
      message
      status
    }
  }
`;

export const TOKEN_KEY = "token";
export const USER_ID_KEY = "userId";
export const TOKEN_EXPIRY_KEY = "tokenExpiresAt";
export const CHECKOUT_SESSION_ID_KEY = "checkoutSessionId";
export const SESSION_DURATION_MS = 60 * 60 * 1000;
export const URL_PREFIX = 'http://localhost:3000'
