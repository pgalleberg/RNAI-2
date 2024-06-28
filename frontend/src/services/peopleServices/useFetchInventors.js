// React Query Imports
import { useQuery } from "@tanstack/react-query";

//services imports
import { GET } from "../AxiosFunctions";
import { urls } from "../urls";

export const useFetchInventors = (
  vertical_id,
) => {

    const fetchInventors = async (vertic_id) => {
    try {
        const response = await GET(urls.people.getInventors + `?id=${vertic_id}`)
        console.log('inventor response',response)
        const uniqueInventors = [];
        const seenInventors = new Set();

        response.forEach(inventor => {
        if (!seenInventors.has(inventor.name)) {
            seenInventors.add(inventor.name);
            uniqueInventors.push(inventor);
        }
        });

        return uniqueInventors
    } catch (error) {
      throw new Error(
        error.response.data.message ?? "Cannot able to fetch data"
      );
    }
  };
  
  return useQuery({
    queryKey: vertical_id ? ["vertial_id_inventors", vertical_id] : [null],
    queryFn: () => fetchInventors( vertical_id ),
    staleTime: Infinity,
    cacheTime: 10 * 60 * 1000,
    retry: 1,
  });
};
