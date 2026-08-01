import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchApi, getToken, removeToken } from "../../../services/api";
import type { User } from "@studenthub/types";
import { useNavigate } from "react-router-dom";

export function useAuth() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    data: user,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const token = getToken();
      if (!token) return null;
      try {
        const response = await fetchApi<{ data: User }>("/auth/me");
        // Our fetchApi returns result.data directly, so it's actually just User if the backend sends { success: true, data: User }
        // Wait, looking at fetchApi: `return result.data as T;`
        // So fetchApi<User>("/auth/me") will return User.
        return response as unknown as User;
      } catch {
        // If token is invalid/expired, remove it
        removeToken();
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Do not retry auth fetch, it's either valid or not
  });

  const logout = async () => {
    try {
      await fetchApi("/auth/logout", { method: "POST" });
    } catch {
      // Ignore network errors on logout, just clear local state
    }
    removeToken();
    localStorage.removeItem("user");
    queryClient.setQueryData(["auth", "me"], null);
    navigate("/");
  };

  return {
    user: user || null,
    isLoading: isLoading || isFetching,
    isAuthenticated: !!user,
    logout,
    refetch,
  };
}
