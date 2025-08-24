import Header from './components/header';
import Hero from './components/hero';
import Purpose from './components/purpose';
import HowItHelps from './components/howItHelps'; 
import HowToPost from './components/howToPost';
import Features from './components/features';
import Testimonials from './components/testimonials';
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