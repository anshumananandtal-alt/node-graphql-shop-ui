import { GRAPHQL_ENDPOINT } from "../constants";

export async function requestGraphQL(query, { signal, variables } = {}) {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      ...(variables ? { variables } : {}),
    }),
    signal,
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(`Request failed (${response.status}).`);
  }

  if (result.errors?.length) {
    const error = new Error(
      result.errors.map(({ message }) => message).join(" "),
    );
    const firstError = result.errors[0];
    const code =
      firstError?.extensions?.code ??
      firstError?.extensions?.status ??
      firstError?.extensions?.exception?.code ??
      firstError?.code;

    if (code !== undefined) {
      error.code = code;
    }

    throw error;
  }

  return result.data;
}

export function ensureMutationSucceeded(result, operation) {
  const status = result?.status;
  const numericStatus =
    typeof status === "number" || (typeof status === "string" && status.trim())
      ? Number(status)
      : Number.NaN;
  if (
    !result ||
    status === false ||
    numericStatus >= 400 ||
    (typeof status === "string" && /^(error|failed)$/i.test(status))
  ) {
    throw new Error(
      result?.message || `Unable to complete ${operation}. Please try again.`,
    );
  }
}
