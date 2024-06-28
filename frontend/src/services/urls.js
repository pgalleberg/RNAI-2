import axios from "axios"

axios.defaults.baseURL = process.env.REACT_APP_FLASK_WEBSERVER;

export const urls = {
    people: {
        getAuthors: '/authors',
        getInventors: '/inventors'
    }
}