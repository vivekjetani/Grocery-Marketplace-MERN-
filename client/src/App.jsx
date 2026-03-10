import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useState, useEffect, useContext } from "react";
import Products from "./pages/Products";
import SingleProduct from "./pages/SingleProduct";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";
import Footer from "./components/Footer";
import { useAppContext, AppContext } from "./context/AppContext";
import ScrollToTop from "./components/ScrollToTop";
import Auth from "./modals/Auth";
import ProductCategory from "./pages/ProductCategory";
import Address from "./pages/Address";
import ProfileLayout from "./pages/profile/ProfileLayout";
import ProfileInfo from "./pages/profile/ProfileInfo";
import ProfileOrders from "./pages/profile/ProfileOrders";
import ProfileAddresses from "./pages/profile/ProfileAddresses";
import SellerLogin from "./components/seller/SellerLogin";
import SellerLayout from "./pages/seller/SellerLayout";
import Dashboard from "./pages/seller/Dashboard";
import AddProduct from "./pages/seller/AddProduct";
import ProductList from "./pages/seller/ProductList";
import Orders from "./pages/seller/Orders";
import CategoryManager from "./pages/seller/CategoryManager";
import Users from "./pages/seller/Users";
import UserDetails from "./pages/seller/UserDetails";
import SmtpSettings from "./pages/seller/SmtpSettings";
import StoreInfo from "./pages/seller/StoreInfo";
import Inquiries from "./pages/seller/Inquiries";
import Captains from "./pages/seller/Captains";
import CaptainLogin from "./pages/captain/CaptainLogin";
import CaptainLayout from "./pages/captain/CaptainLayout";
import CaptainOrders from "./pages/captain/CaptainOrders";
import ReviewFromEmail from "./pages/ReviewFromEmail";
import PageTransition from "./components/PageTransition";
import CustomCursor from "./components/CustomCursor";
import VerifyEmail from "./pages/VerifyEmail";
import Coupons from "./pages/seller/Coupons";
import AdminCareers from "./pages/seller/AdminCareers";
import Careers from "./pages/Careers";
import JobDetails from "./pages/JobDetails";
import About from "./pages/About";
import HelpCenter from "./pages/HelpCenter";
import SafetyInfo from "./pages/SafetyInfo";
import Cancellation from "./pages/Cancellation";
import ContactUs from "./pages/ContactUs";
import Unsubscribe from "./pages/Unsubscribe";
import Newsletter from "./pages/seller/Newsletter";

const App = () => {
  const location = useLocation();
  const isSellerPath = location.pathname.includes("seller");
  const isCaptainPath = location.pathname.startsWith("/captain");
  const { showUserLogin, isSeller } = useAppContext();
  const { axios } = useContext(AppContext);

  // Captain auth state (managed locally, not in global context)
  const [captain, setCaptain] = useState(null);
  const [captainChecked, setCaptainChecked] = useState(false);

  useEffect(() => {
    if (isCaptainPath) {
      axios.get("/api/captain/is-auth").then(({ data }) => {
        if (data.success) setCaptain(data.captain);
        else setCaptain(null);
      }).catch(() => setCaptain(null)).finally(() => setCaptainChecked(true));
    } else {
      setCaptainChecked(true);
    }
  }, [isCaptainPath]);

  // Captain portal rendering
  if (isCaptainPath) {
    if (!captainChecked) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }
    if (!captain) {
      return <CaptainLogin onLogin={(c) => setCaptain(c)} />;
    }
    return (
      <CaptainLayout captain={captain} onLogout={() => setCaptain(null)}>
        <CaptainOrders />
      </CaptainLayout>
    );
  }

  return (
    <div className="text-default min-h-screen flex flex-col overflow-x-hidden">
      <ScrollToTop />
      {isSellerPath ? null : <Navbar />}
      {showUserLogin ? <Auth /> : null}
      <Toaster />
      <div
        className={`flex-grow ${isSellerPath ? "" : "px-6 md:px-16 lg:px-24 xl:px-32"}`}
      >
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname.startsWith('/seller') ? 'seller' : location.pathname}>
            <Route path="/" element={<PageTransition><Home /></PageTransition>} />
            <Route path="/products" element={<PageTransition><Products /></PageTransition>} />
            <Route path="/products/:category" element={<PageTransition><ProductCategory /></PageTransition>} />
            <Route path="/product/:category/:id" element={<PageTransition><SingleProduct /></PageTransition>} />
            <Route path="/cart" element={<PageTransition><Cart /></PageTransition>} />
            <Route path="/add-address" element={<PageTransition><Address /></PageTransition>} />
            <Route path="/verify-email" element={<PageTransition><VerifyEmail /></PageTransition>} />
            <Route path="/review" element={<PageTransition><ReviewFromEmail /></PageTransition>} />
            <Route path="/careers" element={<PageTransition><Careers /></PageTransition>} />
            <Route path="/careers/:id" element={<PageTransition><JobDetails /></PageTransition>} />
            <Route path="/about" element={<PageTransition><About /></PageTransition>} />
            <Route path="/help-center" element={<PageTransition><HelpCenter /></PageTransition>} />
            <Route path="/safety-info" element={<PageTransition><SafetyInfo /></PageTransition>} />
            <Route path="/cancellation" element={<PageTransition><Cancellation /></PageTransition>} />
            <Route path="/contact-us" element={<PageTransition><ContactUs /></PageTransition>} />
            <Route path="/unsubscribe" element={<PageTransition><Unsubscribe /></PageTransition>} />

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
              <Route index element={isSeller ? <Dashboard /> : null} />
              <Route path="add-product" element={isSeller ? <AddProduct /> : null} />
              <Route path="product-list" element={isSeller ? <ProductList /> : null} />
              <Route path="orders" element={isSeller ? <Orders /> : null} />
              <Route path="category-manager" element={isSeller ? <CategoryManager /> : null} />
              <Route path="captains" element={isSeller ? <Captains /> : null} />
              <Route path="users" element={isSeller ? <Users /> : null} />
              <Route path="users/:id" element={isSeller ? <UserDetails /> : null} />
              <Route path="careers" element={isSeller ? <AdminCareers /> : null} />
              <Route path="coupons" element={isSeller ? <Coupons /> : null} />
              <Route path="smtp" element={isSeller ? <SmtpSettings /> : null} />
              <Route path="store-info" element={isSeller ? <StoreInfo /> : null} />
              <Route path="inquiries" element={isSeller ? <Inquiries /> : null} />
              <Route path="newsletter" element={isSeller ? <Newsletter /> : null} />
            </Route>
          </Routes>
        </AnimatePresence>
      </div>
      {isSellerPath ? null : <Footer />}
    </div>
  );
};
export default App;

