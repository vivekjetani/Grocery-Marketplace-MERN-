import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Products from "./pages/Products";
import SingleProduct from "./pages/SingleProduct";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";
import Footer from "./components/Footer";
import { useAppContext } from "./context/AppContext";
import Auth from "./modals/Auth";
import ProductCategory from "./pages/ProductCategory";
import Address from "./pages/Address";
import ProfileLayout from "./pages/profile/ProfileLayout";
import ProfileInfo from "./pages/profile/ProfileInfo";
import ProfileOrders from "./pages/profile/ProfileOrders";
import ProfileAddresses from "./pages/profile/ProfileAddresses";
import SellerLogin from "./components/seller/SellerLogin";
import SellerLayout from "./pages/seller/SellerLayout";
import AddProduct from "./pages/seller/AddProduct";
import ProductList from "./pages/seller/ProductList";
import Orders from "./pages/seller/Orders";
import PageTransition from "./components/PageTransition";
import CustomCursor from "./components/CustomCursor";

const App = () => {
  const location = useLocation();
  const isSellerPath = location.pathname.includes("seller");
  const { showUserLogin, isSeller } = useAppContext();

  return (
    <div className="text-default min-h-screen flex flex-col overflow-x-hidden">
      {isSellerPath ? null : <Navbar />}
      {showUserLogin ? <Auth /> : null}
      <Toaster />
      <div
        className={`flex-grow ${isSellerPath ? "" : "px-6 md:px-16 lg:px-24 xl:px-32"}`}
      >
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><Home /></PageTransition>} />
            <Route path="/products" element={<PageTransition><Products /></PageTransition>} />
            <Route path="/products/:category" element={<PageTransition><ProductCategory /></PageTransition>} />
            <Route path="/product/:category/:id" element={<PageTransition><SingleProduct /></PageTransition>} />
            <Route path="/cart" element={<PageTransition><Cart /></PageTransition>} />
            <Route path="/add-address" element={<PageTransition><Address /></PageTransition>} />
            <Route path="/profile" element={<PageTransition><ProfileLayout /></PageTransition>}>
              <Route index element={<ProfileInfo />} />
              <Route path="info" element={<ProfileInfo />} />
              <Route path="orders" element={<ProfileOrders />} />
              <Route path="addresses" element={<ProfileAddresses />} />
            </Route>
            <Route
              path="/seller"
              element={isSeller ? <PageTransition><SellerLayout /></PageTransition> : <PageTransition><SellerLogin /></PageTransition>}
            >
              <Route index element={isSeller ? <AddProduct /> : null} />
              <Route
                path="product-list"
                element={isSeller ? <ProductList /> : null}
              />
              <Route path="orders" element={isSeller ? <Orders /> : null} />
            </Route>
          </Routes>
        </AnimatePresence>
      </div>
      {isSellerPath ? null : <Footer />}
    </div>
  );
};
export default App;
