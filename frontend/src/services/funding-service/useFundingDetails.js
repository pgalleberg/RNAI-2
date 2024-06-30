// React Query Imports
import { useQuery } from "@tanstack/react-query";
import { GET } from "../AxiosFunctions";
import { urls } from "../urls";

export const useFetchFundingDetails = (
  id
) => {

  const fetchFundings = async (grant_id) => {
    try {
        const response = await GET(urls.funding.getSingleFundingDetails + `?grant_id=${grant_id}`)
        return response
    } catch (error) {
      throw new Error(
        error.response.data.message ?? "Cannot able to fetch data"
      );
    }
  };
  
  return useQuery({
    queryKey: id ? ["grant", id] : [null],
    queryFn: () => fetchFundings( id ),
    staleTime: Infinity,
    cacheTime: 10 * 60 * 1000,
    retry: 1,
  });
};
