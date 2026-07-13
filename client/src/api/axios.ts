import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true, // This is mandatory so HttpOnly cookies pass back and forth
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;