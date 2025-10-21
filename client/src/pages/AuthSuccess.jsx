/* eslint-disable no-undef */
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setLoading, setUser } from "@/redux/authSlice";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

export default function AuthSuccess() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleAuth = async () => {
      dispatch(setLoading(true));

      const params = new URLSearchParams(window.location.search);
      const accessToken = params.get("token");
      console.log("Token", accessToken);
      

      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);

        try {
          // Fetch user details using token
          const res = await axios.get(`${API_URL}/auth/me`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          console.log(res.data);          
          if (res.data.success) {
            dispatch(setUser(res.data.user)); // save user in redux
            navigate("/"); // redirect after success
          } else {
            console.error(data.message);
          }
        } catch (error) {
          console.error("Error fetching user:", error);
        }
      }

      dispatch(setLoading(false));
    };

    handleAuth();
  }, [navigate, dispatch]);

  return <h2>Logging in...</h2>;
}
