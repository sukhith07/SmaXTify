import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyD0D-xVCqf7oorOZU-KGAnnP1VxmxswM_Y",
  authDomain: "smaxtify.firebaseapp.com",
  projectId: "smaxtify",
  storageBucket: "smaxtify.firebasestorage.app",
  messagingSenderId: "19826010878",
  appId: "1:19826010878:web:1f9afcc18b530b5537d3af",
  measurementId: "G-L87KHGHSER",
};

const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);

export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();

export default app;