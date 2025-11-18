const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

export const api = {
  auth: {
    challenge: (address: string) =>
      fetch(`${API_BASE}/auth/wallet-challenge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      }).then((r) => r.json()),

    verify: (
      address: string,
      signedMessage: string,
      challengeMessage: string,
    ) =>
      fetch(`${API_BASE}/auth/wallet-verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, signedMessage, challengeMessage }),
      }).then((r) => r.json()),
  },

  wish: {
    create: (data: any, token: string) =>
      fetch(`${API_BASE}/wish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }).then((r) => r.json()),

    get: (id: string) => fetch(`${API_BASE}/wish/${id}`).then((r) => r.json()),

    list: (params?: {
      search?: string;
      status?: string;
      category?: string;
      minStake?: number;
      maxStake?: number;
      dateRange?: string;
      sortBy?: string;
      limit?: number;
      cursor?: string;
    }) => {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append("search", params.search);
      if (params?.status && params.status !== "all")
        queryParams.append("status", params.status);
      if (params?.category && params.category !== "all")
        queryParams.append("category", params.category);
      if (params?.minStake)
        queryParams.append("minStake", params.minStake.toString());
      if (params?.maxStake)
        queryParams.append("maxStake", params.maxStake.toString());
      if (params?.dateRange && params.dateRange !== "all")
        queryParams.append("dateRange", params.dateRange);
      if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.cursor) queryParams.append("cursor", params.cursor);

      return fetch(`${API_BASE}/wish?${queryParams.toString()}`).then((r) =>
        r.json(),
      );
    },

    pledge: (id: string, amount: number, token: string) =>
      fetch(`${API_BASE}/wish/${id}/pledge`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
      }).then((r) => r.json()),

    postProof: (id: string, formData: FormData, token: string) =>
      fetch(`${API_BASE}/wish/${id}/proof`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }).then((r) => r.json()),
  },

  follow: {
    follow: (userId: string, token: string) =>
      fetch(`${API_BASE}/follow/${userId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),

    unfollow: (userId: string, token: string) =>
      fetch(`${API_BASE}/follow/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),

    getFollowers: (
      userId: string,
      params?: { limit?: number; skip?: number },
    ) => {
      const queryParams = new URLSearchParams();
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.skip) queryParams.append("skip", params.skip.toString());
      return fetch(
        `${API_BASE}/follow/${userId}/followers?${queryParams.toString()}`,
      ).then((r) => r.json());
    },

    getFollowing: (
      userId: string,
      params?: { limit?: number; skip?: number },
    ) => {
      const queryParams = new URLSearchParams();
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.skip) queryParams.append("skip", params.skip.toString());
      return fetch(
        `${API_BASE}/follow/${userId}/following?${queryParams.toString()}`,
      ).then((r) => r.json());
    },

    getStatus: (userId: string, token: string) =>
      fetch(`${API_BASE}/follow/${userId}/status`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),

    getStats: (userId: string) =>
      fetch(`${API_BASE}/follow/stats/${userId}`).then((r) => r.json()),
  },
};
