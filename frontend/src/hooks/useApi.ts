import useSWR from "swr";
import { api } from "../services/api";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export const useWishList = (params?: any) => {
  const query = new URLSearchParams(params).toString();
  return useSWR(`/wish?${query}`, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000, // 30s
  });
};

export const useWishDetail = (id: string) => {
  return useSWR(id ? `/wish/${id}` : null, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  });
};

// Add more hooks as needed
