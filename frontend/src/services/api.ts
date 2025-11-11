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
};
