import Banner from "../components/Banner";
import BestSeller from "../components/BestSeller";
import Category from "../components/Category";
import NewsLetter from "../components/NewsLetter";
import RecommendedProducts from "../components/RecommendedProducts";

const Home = () => {
  return (
    <div className="mt-10">
      <Banner />
      <Category />
      <BestSeller />
      <RecommendedProducts />
      <NewsLetter />
    </div>
  );
};
export default Home;
