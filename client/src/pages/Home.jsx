import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import Navbar from "../components/Navbar";
import waveLogo from "../assets/logo.svg";
import home9 from "../assets/home9.webp";
import home10 from "../assets/home10.webp";
import "./Home.css";

import home1 from "../assets/home1.webp";
import home2 from "../assets/home2.webp";
import home3 from "../assets/home3.webp";
import home4 from "../assets/home4.webp";
import home5 from "../assets/home5.webp";
import home6 from "../assets/home6.webp";
import home7 from "../assets/home7.webp";
import home8 from "../assets/home8.webp";
import home11 from "../assets/home11.webp";
import home12 from "../assets/home12.webp";
import home13 from "../assets/home13.webp";
import Footer from "../components/Footer";

const slides = [home1, home2, home3, home4, home5, home6, home7, home8];

const facebookUrl =
  "https://www.facebook.com/share/19ETyRFQf4/?mibextid=wwXIfr";

function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentSlide((current) => (current + 1) % slides.length);
    }, 5500);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <main className="club-nalu-home">
      {/* FIRST SECTION: HERO */}
      <section className="home-hero" id="home">
        <div className="hero-slideshow" aria-hidden="true">
          {slides.map((image, index) => (
            <div
              key={image}
              className={`hero-slide ${
                currentSlide === index ? "hero-slide-active" : ""
              }`}
              style={{ backgroundImage: `url("${image}")` }}
            />
          ))}
        </div>

        <div className="hero-overlay" />

        <Navbar />

        <div className="hero-center">
          <img className="hero-wave-logo" src={waveLogo} alt="" />

          <h1>FIND YOUR FLOW</h1>

          <div className="hero-socials">
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
              aria-label="Club Nalu on Facebook"
            >
              <FaFacebookF />
            </a>

            <button
              type="button"
              className="social-icon"
              aria-label="Instagram profile not yet available"
              title="Instagram link coming soon"
              disabled
            >
              <FaInstagram />
            </button>
          </div>

          <Link to="/booking" className="hero-book-button">
            Plan Your Stay
          </Link>
        </div>
      </section>
      {/* SECOND SECTION: WHERE STILLNESS MEETS STYLE */}
      <section className="stillness-section" id="about">
        <div className="stillness-content">
          <h2>
            WHERE STILLNESS
            <br />
            MEETS STYLE
          </h2>

          <p>
            Located on the serene shores of Bacnotan, La Union, Club Nalu is a
            boutique beachfront retreat designed for intentional living and
            barefoot luxury. The property is thoughtfully built with warm wood,
            natural stone, and open-air spaces to invite a slower, more grounded
            way to experience the sea. This is a place where stillness meets
            style and every moment is meant to be felt.
          </p>
        </div>

        <div className="stillness-image-wrapper">
          <img
            src={home9}
            alt="Club Nalu accommodation featuring natural wood and calming interiors"
            className="stillness-image"
          />
        </div>
      </section>
      {/* THIRD SECTION: SLOW MORNINGS, MEANINGFUL MOMENTS */}
      <section className="slow-mornings-section" id="experiences">
        <div className="slow-mornings-image">
          <img
            src={home10}
            alt="Club Nalu surrounded by tropical greenery and natural architecture"
          />
        </div>

        <div className="slow-mornings-content">
          <h2>
            SLOW MORNINGS.
            <br />
            MEANINGFUL
            <br />
            MOMENTS.
          </h2>

          <p>
            Club Nalu was built for the ones who crave balance — that sweet spot
            between feeling held and feeling free. Every space reflects a deep
            respect for nature, local texture, and quiet indulgence. We’re not
            here to impress; we’re here to make you feel at ease. From our
            open-air spaces to the subtle details in every room, Club Nalu
            invites you to drop the performance and just be.
          </p>

          <Link to="/booking" className="slow-mornings-book-link">
            Plan Your Stay
          </Link>
        </div>
      </section>
      {/* FOURTH SECTION: WHERE CALM COMES NATURALLY */}
      <section className="calm-section" id="accommodations">
        <div className="calm-background">
          <img
            src={home6}
            alt="A peaceful Club Nalu guest room with soft linens and natural textures"
          />
        </div>

        <div className="calm-content">
          <h2>
            WHERE CALM
            <br />
            COMES NATURALLY
          </h2>

          <p>
            Think linen sheets, wooden beams, ocean breeze, and no rush. Our
            rooms and villas are designed with intention — clean lines, warm
            light, and textures that echo the coast. It’s the kind of place that
            doesn’t try too hard and doesn’t need to. Whether you’re staying in
            a sun-drenched villa or one of our cozy rooms, this is your space to
            rest, reflect, and reset.
          </p>
        </div>
      </section>
      {/* FIFTH SECTION: A TASTE OF ITALY IN LA UNION */}
      <section className="italian-dining-section" id="dining">
        <div className="italian-dining-content">
          <h2>
            A TASTE OF ITALY
            <br />
            IN LA UNION
          </h2>

          <p>
            Amare La Cucina is a cozy Italian restaurant located inside Club
            Nalu, known for its wood-fired Neapolitan pizzas, hearty pastas, and
            flavorful mains served in a warm and inviting atmosphere. Guests can
            enjoy generous portions, friendly service, and the unique experience
            of watching pizzas baked in a traditional stone oven right before
            their eyes. It’s the perfect spot to unwind and indulge in a relaxed
            yet delicious dining experience after a day by the waves.
          </p>
        </div>

        <div className="italian-dining-image">
          <img
            src={home11}
            alt="Pizza served at Amare La Cucina, Club Nalu's Italian restaurant"
          />
        </div>
      </section>
      {/* SIXTH SECTION: THE QUIET SIDE OF LA UNION */}
      <section className="quiet-side-section" id="destination">
        <div className="quiet-side-content">
          <h2>
            THE QUIET SIDE OF
            <br />
            LA UNION
          </h2>

          <p>
            Located on the tranquil coast of Bacnotan, La Union, Club Nalu
            offers a different kind of escape. Bacnotan is not the loud version
            of La Union seen on social media, and that is exactly the point. The
            pace is slower, the beaches are quieter, and the sunsets last
            longer. Club Nalu sits far enough from the buzz to feel like a true
            sanctuary, yet remains close enough for a surf session or a café
            crawl. Come for the stillness and stay for the sense of self you
            rediscover here.
          </p>
        </div>
      </section>
      {/* SEVENTH SECTION: FULL-WIDTH RESORT IMAGE */}
      <section className="resort-image-section">
        <img src={home12} alt="Club Nalu resort at night" />
      </section>
      {/* EIGHTH SECTION: COME AS YOU ARE */}
      <section className="come-as-you-are-section">
        <div className="come-as-you-are-content">
          <div className="come-as-you-are-text">
            <h2>
              COME AS YOU ARE.
              <br />
              LEAVE A LITTLE LIGHTER.
            </h2>

            <p>
              Whether you're chasing peace, play, or something in between, Club
              Nalu meets you where you are. Take the weekend. Take your time.
              This is your invitation to step back, sink in, and start again —
              surrounded by nature, beauty, and just the right amount of quiet.
            </p>

            <Link to="/booking" className="plan-stay-button">
              Plan Your Stay
            </Link>
          </div>

          <div className="come-as-you-are-image">
            <img src={home13} alt="A surfer enjoying the beach at Club Nalu" />
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

export default Home;
