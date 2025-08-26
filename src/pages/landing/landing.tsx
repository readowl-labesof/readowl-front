import Header from '../../components/header';
import Hero from './about/hero';
import Purpose from './about/purpose';
import HowItHelps from './about/howItHelps'; 
import HowToPost from './about/howToPost';
import Features from './about/features';
import Testimonials from './about/testimonials';
import Footer from '../../components/footer';

function App() {
  return (
    <div className="bg-white">
      <Header />
      <main>
        <Hero />
        <Purpose />
        <HowItHelps />
        <HowToPost />
        <Features />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}

export default App;