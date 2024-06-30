// React Query Imports
import { useQuery } from "@tanstack/react-query";

//services imports
import { GET } from "../AxiosFunctions";
import { urls } from "../urls";

export const useFetchTask = (
  vertical_id,
) => {

    const fetchTask = async (vertic_id) => {
    try {
        const response = await GET(urls.task.getTask + `?id=${vertic_id}`)

        return response
    } catch (error) {
      throw new Error(
        error.response.data.message ?? "Cannot able to fetch data"
      );
    }
  };
  
  return useQuery({
    queryKey: vertical_id ? ["task", vertical_id] : [null],
    queryFn: () => fetchTask( vertical_id ),
    staleTime: Infinity,
    cacheTime: 10 * 60 * 1000,
    retry: 1,
  });
};
