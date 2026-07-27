import Hero from "../components/Hero/Hero";
import QuickActions from "../components/QuickActions/QuickActions";
import Services from "../components/Services/Services";
import WhyChooseUs from "../components/WhyChooseUs/WhyChooseUs";
import "./Home.css";

const Home = () => {
  return (
    <>
      <Hero />
      <QuickActions />
      <Services />
      <WhyChooseUs />
    </>
  );
};

export default Home;