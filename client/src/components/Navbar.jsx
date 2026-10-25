import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";
import waveLogo from "../assets/logo.svg";

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
      <nav className="navbar-inner" aria-label="Main navigation">
        <div className="navbar-left">
          <Link
            to="/"
            className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
          >
            Home
          </Link>

          <Link
            to="/blog"
            className={`nav-link ${location.pathname === "/blog" ? "active" : ""}`}
          >
            Blog
          </Link>
        </div>

        <Link to="/" className="navbar-logo" aria-label="Club Nalu home">
          {!scrolled ? (
            <span className="navbar-logo-normal">CLUB NALU</span>
          ) : (
            <span className="navbar-logo-scrolled">
              <span>CLUB</span>
              <img src={waveLogo} alt="" />
              <span>NALU</span>
            </span>
          )}
        </Link>

        <div className="navbar-right" aria-hidden="true" />
      </nav>
    </header>
  );
}

export default Navbar;
