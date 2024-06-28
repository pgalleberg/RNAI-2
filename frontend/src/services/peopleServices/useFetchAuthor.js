// React Query Imports
import { useQuery } from "@tanstack/react-query";

//services imports
import { GET } from "../AxiosFunctions";
import { urls } from "../urls";

export const useFetchAuthors = (
  vertical_id,
) => {

    const fetchAuthors = async (vertic_id) => {
    try {
        // if(params){
        //     endPoint = endPoint + '?' + new URLSearchParams(params).toString();
        // }
        const response = await GET(urls.people.getAuthors + `?id=${vertic_id}`)
        console.log('author response',response)
        const uniqueAuthors = [];
        const seenAuthors = new Set();
    
        response.forEach(author => {
          if (!seenAuthors.has(author.authorId)) {
            seenAuthors.add(author.authorId);
            uniqueAuthors.push(author);
          }
        });
    
        return uniqueAuthors
    } catch (error) {
      throw new Error(
        error.response.data.message ?? "Cannot able to fetch data"
      );
    }
  };
  
  return useQuery({
    queryKey: vertical_id ? ["vertial_id_author", vertical_id] : [null],
    queryFn: () => fetchAuthors( vertical_id ),
    staleTime: Infinity,
    cacheTime: 10 * 60 * 1000,
    retry: 1,
  });
};
