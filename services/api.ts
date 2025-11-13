import { User } from 'firebase/auth';

export const authenticatedFetch = async (
  url: string,
  user: User,
  options: RequestInit = {}
) => {
  const token = await user.getIdToken();

  const headers = {
    ...options.headers,
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: { message: `Request failed with status ${response.status}` }}));
    throw new Error(errorData.error?.message || `Request failed with status ${response.status}`);
  }

  // Handle cases where there might be no JSON body (e.g., 204 No Content)
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return response.json();
  }
  return { success: true };
};
