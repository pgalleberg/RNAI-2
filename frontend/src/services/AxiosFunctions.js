// Request methods for axios
import Axios from 'axios'

/**
 * @GET request
 * @Params {String} endPoint, {String} access_token, {String} refresh_token
 * @endPoint : Url to hit.
 */
export const GET = async (
  endPoint,
)=> {
  return new Promise((resolve, reject) => {
    Axios.get(endPoint)
      .then((response) => {
        if (response) {
          resolve(response.data)
        }
      })
      .catch((error) => {
        console.error(error)
        reject(error)
      })
  })
}

/**
 * @POST request
 * @Params
 * @BaseUrl : Url to hit.
 * @Header : Authorization Token.
 */
export const POST = async (
  endPoint,
  data,
) =>
  new Promise((resolve, reject) => {
    Axios.post(endPoint, data)
      .then((response) => {
        if (response) {
          resolve(response.data)
        }
      })
      .catch((error) => {
        console.error('response error', error)
        reject(error)
      })
  })

/**
 * @PUT request
 * @Params
 * @Header : Authorization Token.
 */
export const PUT = async (
  endPoint,
  data,
) =>
  new Promise((resolve, reject) => {
    Axios.put(endPoint, data)
      .then((response) => {
        if (response) {
          resolve(response.data)
        }
      })
      .catch((error) => {
        console.error({ error })
        reject(error)
      })
  })

/**
 * @DELETE request
 * @Params
 * @Header : Authorization Token.
 */
export const DELETE = async (
  endpoint,
  data
) => {
  return new Promise((resolve, reject) => {
    Axios.delete(endpoint, { data })
      .then((res) => {
        if (res) {
          resolve(res.data)
        }
      })
      .catch((error) => {
        reject(error)
        throw error
      })
  })
}
