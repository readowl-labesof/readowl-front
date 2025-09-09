import HeaderLanding from './components-landing/headerlLanding';
import Hero from './components-landing/hero';
import Purpose from './components-landing/purpose';
import HowItHelps from './components-landing/howItHelps'; 
import HowToPost from './components-landing/howToPost';
import Features from './components-landing/features';
import Testimonials from './components-landing/testimonials';
import Footer from '../../components/footer';


function App() {
  return (
    <div className="bg-white">
      <HeaderLanding />
      <main>
        <Hero />
       <div id="sobre"><Purpose /></div>
        <div id="ajuda"><HowItHelps /></div>
        <div id="postar"><HowToPost /></div>
        <div id="recursos"><Features /></div>
        <div id="depoimentos"><Testimonials /></div>
      </main>
      <Footer />
    </div>
  );
}

export default App;