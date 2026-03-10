import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyProducts } from "../assets/assets";
import toast from "react-hot-toast";
import axios from "axios";
axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;
export const AppContext = createContext(null);

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark" || (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    return false;
  });

  // Cross-tab synchronization channel
  const [syncChannel] = useState(() => new BroadcastChannel("app_state_sync"));

  // Handle Auth Interceptor
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          // Suppress 401 unauthenticated toasts globally
          return Promise.resolve({ data: { success: false, message: "Unauthenticated" } });
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  // Handle Dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  // check seller status
  const fetchSeller = async () => {
    try {
      const { data } = await axios.get("/api/seller/is-auth");
      if (data.success) {
        setIsSeller(true);
      } else {
        setIsSeller(false);
      }
    } catch (error) {
      setIsSeller(false);
    }
  };

  // fetch user auth status ,user Data and cart items
  const fetchUser = async () => {
    try {
      const { data } = await axios.get("/api/user/is-auth");
      if (data.success) {
        setUser(data.user);
        setCartItems(data.user.cartItems);
      }
      // Silently handle unauthenticated state — no toast for guests
    } catch (error) {
      // Silently handle auth check failure
    }
  };

  // fetch products
  const fetchProducts = async (broadcast = true) => {
    try {
      const { data } = await axios.get("/api/product/list");
      if (data.success) {
        setProducts(data.products);
        if (broadcast) syncChannel.postMessage("REFRESH_PRODUCTS");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // fetch and unify categories
  const fetchCategories = async (broadcast = true) => {
    try {
      const { data } = await axios.get("/api/category/list");
      if (data.success) {
        // Map backend categories to match the frontend shape
        const dynamicCategories = data.categories.map((cat) => ({
          _id: cat._id,
          text: cat.name,
          path: cat.name,
          image: getImageUrl(cat.image),
          bgColor: cat.bgColor || "#FEE0E0",
          isDynamic: true,
        }));
        setCategories(dynamicCategories);
        if (broadcast) syncChannel.postMessage("REFRESH_CATEGORIES");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };
  // helper for image urls
  const getImageUrl = (url) => {
    if (!url) return "";
    return url.startsWith("http") ? url : `${import.meta.env.VITE_BACKEND_URL}/images/${url}`;
  };

  // add product to cart
  const addToCart = (itemId) => {
    let cartData = structuredClone(cartItems || {}); // safeguard for undefined

    if (cartData[itemId]) {
      cartData[itemId] += 1;
    } else {
      cartData[itemId] = 1;
    }

    setCartItems(cartData);
    toast.success("Added to cart");
  };

  // update cart item quantity
  const updateCartItem = (itemId, quantity) => {
    let cartData = structuredClone(cartItems);
    cartData[itemId] = quantity;
    setCartItems(cartData);
    toast.success(`cart updated`);
  };

  // total cart items
  const cartCount = () => {
    let totalCount = 0;
    for (const item in cartItems) {
      totalCount += cartItems[item];
    }
    return totalCount;
  };
  // total cart amount
  const totalCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = products.find((product) => product._id === items);
      if (itemInfo && cartItems[items] > 0) {
        totalAmount += cartItems[items] * itemInfo.offerPrice;
      }
    }
    return Math.floor(totalAmount * 100) / 100;
  };
  // remove product from cart
  const removeFromCart = (itemId) => {
    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      cartData[itemId] -= 1;
      if (cartData[itemId] === 0) {
        delete cartData[itemId];
      }
      toast.success(`remove from cart`);
      setCartItems(cartData);
    }
  };
  useEffect(() => {
    fetchSeller();
    fetchCategories();
    fetchProducts();
    fetchUser();
  }, []);

  // Listen for sync signals from other tabs
  useEffect(() => {
    const handleSync = (event) => {
      if (event.data === "REFRESH_PRODUCTS") fetchProducts(false);
      if (event.data === "REFRESH_CATEGORIES") fetchCategories(false);
    };

    syncChannel.addEventListener("message", handleSync);
    return () => {
      syncChannel.removeEventListener("message", handleSync);
    };
  }, [syncChannel]);

  // update database cart items
  useEffect(() => {
    const updateCart = async () => {
      try {
        const { data } = await axios.post("/api/cart/update", { cartItems });

        if (!data.success) {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error(error.message);
      }
    };

    if (user && cartItems) {
      updateCart();
    }
  }, [cartItems]);
  const value = {
    navigate,
    user,
    setUser,
    isSeller,
    setIsSeller,
    showUserLogin,
    setShowUserLogin,
    products,
    categories,
    fetchCategories,
    cartItems,
    addToCart,
    updateCartItem,
    removeFromCart,
    searchQuery,
    setSearchQuery,
    cartCount,
    totalCartAmount,
    axios,
    fetchProducts,
    setCartItems,
    isDarkMode,
    setIsDarkMode,
    appliedCoupon,
    setAppliedCoupon,
    getImageUrl,
    backendUrl: import.meta.env.VITE_BACKEND_URL,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};
