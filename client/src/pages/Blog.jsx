import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import blogImage from "../assets/blog1.webp";
import logo from "../assets/logo.svg";

import home5 from "../assets/home5.webp";
import blog2 from "../assets/blog2.webp";
import blog3 from "../assets/blog3.webp";
import home9 from "../assets/home9.webp";
import blog4 from "../assets/blog4.webp";
import blog5 from "../assets/blog5.webp";
import home4 from "../assets/home4.webp";
import home6 from "../assets/home6.webp";

import "./Blog.css";

function Blog() {
  const blogPosts = [
    {
      image: home5,
      title: "YOUR PRIVATE PARADISE: EXPLORING CLUB NALU'S VILLAS AND ROOMS",
      date: "October 16, 2026",
      description:
        "Explore Club Nalu's private villas and rooms in Bacnotan, La Union, with natural materials, open-air design, and a quiet beachfront setting.",
    },
    {
      image: blog2,
      title: "CHASING GOLDEN HOUR: THE BEST LIGHT AND SUNSETS AT CLUB NALU",
      date: "September 29, 2026",
      description:
        "Find your perfect La Union sunset at Club Nalu, a boutique beachfront retreat in Bacnotan with open western views and quiet coastal evenings.",
    },
    {
      image: blog3,
      title: "SURF NEARBY, STAY SERENE: CLUB NALU'S PERFECT LOCATION GUIDE",
      date: "September 9, 2026",
      description:
        "Discover where to stay in La Union for surf season. Club Nalu in Bacnotan puts San Juan's breaks 20 minutes away and the quiet coast right outside your door.",
    },
    {
      image: home9,
      title: "THE QUIET JOY OF TRAVELING SOLO: A SOLO RETREAT AT CLUB NALU",
      date: "August 20, 2026",
      description:
        "Plan a solo trip to La Union this August long weekend. Club Nalu in Bacnotan offers quiet beachfront stays, unhurried days, and boutique calm for solo travels.",
    },
    {
      image: home5,
      title: "MID-YEAR RESET: RECHARGE AT CLUB NALU WITHOUT THE CROWDS",
      date: "August 14, 2026",
      description:
        "Escape mid-year burnout at Club Nalu, a boutique hotel in Bacnotan, La Union. Quiet beaches, barefoot luxury, and no crowds. Book your August long weekend stay.",
    },
    {
      image: blog4,
      title: "SLOW RITUALS: A DAY OF WELLNESS AND SELF-CARE AT CLUB NALU",
      date: "July 30, 2026",
      description:
        "Discover a wellness retreat in La Union worth slowing down for. A dawn swim, an unhurried breakfast, long afternoons — one restorative day at Club Nalu.",
    },
    {
      image: blog5,
      title:
        "THE 48-HOUR LA UNION WEEKEND: YOUR COMPLETE GETAWAY GUIDE TO CLUB NALU",
      date: "July 10, 2026",
      description:
        "Your complete 48-hour itinerary for a weekend getaway at Club Nalu — boutique hotel in Bacnotan, La Union with pool, beachfront dining, and real rest.",
    },
    {
      image: home4,
      title: "WHERE TO STAY IN LA UNION FOR A WORKCATION THAT ACTUALLY WORKS",
      date: "June 29, 2026",
      description:
        "Looking for where to stay in La Union for a workcation? Club Nalu is a calm beachfront resort with fast Wi-Fi, an infinity pool, and lower weekday rates.",
    },
    {
      image: blog2,
      title: "THE SLOWEST, SOFTEST STRETCH OF THE YEAR IN LA UNION",
      date: "June 19, 2026",
      description:
        "Discover why the green season is Club Nalu's most restful time. Quieter shores, softer light, and a La Union beach resort made for slowing down.",
    },
    {
      image: home5,
      title:
        "WELCOME TO CLUB NALU: THE LA UNION RETREAT THAT'S REDEFINING WHAT A BEACH ESCAPE CAN FEEL LIKE",
      date: "May 29, 2026",
      description:
        "Discover Club Nalu, a boutique resort in Bacnotan, La Union built for slow travel, barefoot luxury, and intentional coastal living. Book your stay today.",
    },
  ];

  const goToFirstPost = () => {
    document.getElementById("blog-post-1")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const goToLastPost = () => {
    document.getElementById("blog-post-10")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const goToHorizontalGrid = () => {
    document.getElementById("blog-horizontal-grid")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="club-blog-page">
      {/* BLOG HERO */}
      <section
        className="blog-hero"
        style={{ backgroundImage: `url(${blogImage})` }}
      >
        <Navbar />

        <div className="blog-hero-overlay"></div>

        <div className="blog-hero-content">
          <img
            src={logo}
            alt="Club Nalu wave logo"
            className="blog-wave-logo"
          />

          <h1>
            NOTES FROM THE
            <br />
            QUIET SIDE
          </h1>

          <p>
            Stories, slow rituals, and small discoveries from Bacnotan. Written
            between
            <br className="blog-desktop-break" />
            sunrises, surf sessions, and second cups of coffee.
          </p>

          <Link to="/booking" className="blog-plan-stay-button">
            Plan Your Stay
          </Link>
        </div>
      </section>

      {/* BLOG INTRODUCTION */}
      <section className="blog-intro-section">
        <div className="blog-intro-content">
          <p>
            This is where we slow down long enough to write things down. Recipes
            from Amare. A short list of where to find the best coffee in town.
            The case for a Tuesday arrival instead of a Friday one. Nothing
            urgent. Just the kind of things we'd tell a friend who's about to
            visit. Stay a while.
          </p>

          <Link to="/booking" className="blog-intro-button">
            Plan Your Stay
          </Link>
        </div>
      </section>

      {/* ALL 10 BLOG POSTS: VERTICAL LIST */}
      <section
        className="blog-posts-section"
        aria-label="All blog posts in vertical layout"
      >
        {blogPosts.map((post, index) => (
          <article
            className="blog-post-row"
            id={`blog-post-${index + 1}`}
            key={`${post.title}-${index}`}
          >
            <div className="blog-post-image">
              <img src={post.image} alt={post.title} loading="lazy" />
            </div>

            <div className="blog-post-content">
              <h2>{post.title}</h2>

              <p className="blog-post-meta">
                By IMS HII <span>•</span> {post.date}
              </p>

              <p className="blog-post-description">{post.description}</p>
            </div>
          </article>
        ))}
      </section>

      {/* VERTICAL LIST NAVIGATION */}
      <nav className="blog-pagination" aria-label="Vertical blog navigation">
        <button
          type="button"
          className="blog-page-arrow"
          aria-label="Go to first blog post"
          onClick={goToFirstPost}
        >
          ‹
        </button>

        <button
          type="button"
          className="blog-page-number active"
          aria-label="Return to the first vertical blog post"
          onClick={goToFirstPost}
        >
          1
        </button>

        <button
          type="button"
          className="blog-page-arrow"
          aria-label="Go to last blog post"
          onClick={goToLastPost}
        >
          ›
        </button>
      </nav>

      {/* HORIZONTAL BLOG GRID: SAME 10 POSTS */}
      <section
        id="blog-horizontal-grid"
        className="blog-grid-section"
        aria-label="Explore all Club Nalu stories"
      >
        <div className="blog-grid">
          {blogPosts.map((post, index) => (
            <article
              className="blog-grid-card"
              key={`grid-${post.title}-${index}`}
            >
              <div className="blog-grid-image">
                <img src={post.image} alt={post.title} loading="lazy" />
              </div>

              <div className="blog-grid-content">
                <h2>{post.title}</h2>
                <p className="blog-grid-description">{post.description}</p>
              </div>
            </article>
          ))}
        </div>

        {/* HORIZONTAL GRID NAVIGATION: RETURN TO GRID TOP */}
        <nav
          className="blog-grid-pagination"
          aria-label="Horizontal blog grid navigation"
        >
          <button
            type="button"
            className="blog-grid-page-number active"
            aria-label="Return to the beginning of the horizontal blog grid"
            onClick={goToHorizontalGrid}
          >
            1
          </button>
        </nav>
      </section>
      {/* FEATURED IMAGE SECTION WITH OVERLAY TEXT BOX */}
      <section
        className="blog-featured-stay"
        style={{ backgroundImage: `url(${home6})` }}
      >
        <div className="blog-featured-stay-box">
          <h2>
            READING IS NICE.
            <br />
            BEING HERE IS BETTER.
          </h2>

          <p>Take the weekend. Take your time. Come find your flow.</p>

          <Link to="/booking" className="blog-featured-stay-button">
            Plan Your Stay
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Blog;
