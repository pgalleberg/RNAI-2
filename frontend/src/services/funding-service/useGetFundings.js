// React Query Imports
import { useQuery } from "@tanstack/react-query";
import { GET } from "../AxiosFunctions";
import { urls } from "../urls";

export const useFetchFundings = (
  vertial_id
) => {

  const fetchFundings = async (vertic_id) => {
    try {
        const response = await GET(urls.funding.getFundingDetails + `?id=${vertic_id}`)
        return response
    } catch (error) {
      throw new Error(
        error.response.data.message ?? "Cannot able to fetch data"
      );
    }
  };
  
  return useQuery({
    queryKey: vertial_id ? ["vertial_id", vertial_id] : [null],
    queryFn: () => fetchFundings( vertial_id ),
    staleTime: Infinity,
    cacheTime: 10 * 60 * 1000,
    retry: 1,
  });
};
