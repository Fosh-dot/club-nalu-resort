import { useState } from "react";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import Badge from "../assets/Badge.svg";
import Manage from "../assets/manage.svg";
import "./Footer.css";

function Footer() {
  const [email, setEmail] = useState("");
  const [receiveUpdates, setReceiveUpdates] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();

    if (!receiveUpdates) {
      alert("Please tick the checkbox to receive updates.");
      return;
    }

    if (!email.trim()) {
      alert("Please enter your email address.");
      return;
    }

    // Newsletter submission can be connected to a backend later.
    alert("Newsletter functionality will be connected soon.");
  };

  return (
    <footer className="club-footer">
      <div className="footer-main">
        {/* LEFT: HOSPITALITY INNOVATORS */}
        <div className="footer-column footer-hospitality">
          <img
            src={Manage}
            alt="Hospitality Innovators"
            className="footer-badge-logo"
          />

          <p>
            For a full list of our services and
            <br />
            the properties we manage, please
            <br />
            visit{" "}
            <a
              href="https://hii.com.ph"
              target="_blank"
              rel="noopener noreferrer"
            ></a>
          </p>
        </div>

        {/* CENTER: CLUB NALU */}
        <div className="footer-column footer-contact">
          <img src={Badge} alt="Club Nalu" className="footer-nalu-logo" />

          <address>
            <span>Baroro, Bacnotan, La Union</span>

            <a href="tel:+639173112141">+639197841294</a>

            <a href="mailto:reservations@clubnalu.ph">
              naluresortclub@gmail.com
            </a>
          </address>
        </div>

        {/* RIGHT: NEWSLETTER */}
        <div className="footer-column footer-newsletter">
          <h2>BE IN THE LOOP</h2>

          <form onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="EMAIL"
              aria-label="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label className="footer-consent">
              <input
                type="checkbox"
                checked={receiveUpdates}
                onChange={(e) => setReceiveUpdates(e.target.checked)}
              />

              <span>
                Please tick the box if you wish to receive offers, updates, and
                information from Hospitality Innovators, Inc.
              </span>
            </label>

            <button type="submit">SUBSCRIBE</button>
          </form>
        </div>
      </div>

      {/* FOOTER BOTTOM */}
      <div className="footer-bottom">
        <div className="footer-legal">
          <p>Club Nalu. All Rights Reserved.</p>

          <div className="footer-legal-links">
            <a href="/privacy-policy">Privacy Policy</a>
            <span>|</span>
            <a href="/internet-fraud-scam-alert">
              Internet Fraud and Scam Alert
            </a>
          </div>
        </div>

        <p className="footer-copyright">© 2026</p>

        <div className="footer-socials">
          <a
            href="https://www.facebook.com/share/19ETyRFQf4/?mibextid=wwXIfr"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
          >
            <FaFacebookF />
          </a>

          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <FaInstagram />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
