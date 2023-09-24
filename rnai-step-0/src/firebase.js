// Import necessary methods and functions
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your Firebase configuration object
const firebaseApp = {
  apiKey: "AIzaSyCW52xsgnNYqAIppb5mrzBabFS85_i6GrA",
  authDomain: "rnai-68528.firebaseapp.com",
  projectId: "rnai-68528",
  storageBucket: "rnai-68528.appspot.com",
  messagingSenderId: "71873913285",
  appId: "1:71873913285:web:4eb3aff90415c85e3aabac",
  measurementId: "G-YQS8LFKNRD"
};

// Initialize Firebase
const app = initializeApp(firebaseApp);

// Get Auth instance
const auth = getAuth(app);

// Export for use in other files
export default auth;

