// React Query Imports
import { useQuery } from "@tanstack/react-query";

export const useFetchFundings = (
  vertial_id,
) => {

  const fetchFundings = async (vertial_id) => {
    if (!payload.document_id) return;
    try {
        //fetching the data here
    } catch (error) {
      throw new Error(
        error.response.data.message ?? "Cannot able to fetch data"
      );
    }
  };
  
  return useQuery({
    queryKey: vertial_id ? ["vertial_id", vertial_id] : [null],
    queryFn: () => fetchFundings({ vertial_id }),
    staleTime: Infinity,
    cacheTime: 10 * 60 * 1000,
    retry: 1,
  });
};
