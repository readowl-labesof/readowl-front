import Header from './components/header';
import Hero from './components/about/hero';
import Purpose from './components/about/purpose';
import HowItHelps from './components/about/howItHelps'; 
import HowToPost from './components/about/howToPost';
import Features from './components/about/features';
import Testimonials from './components/about/testimonials';
import Footer from '../../global/footer';

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