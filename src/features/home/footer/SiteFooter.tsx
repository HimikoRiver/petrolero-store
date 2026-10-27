import "./SiteFooter.css";

// The reference includes five social symbols, but no verified account URLs.
// Keep them presentational until real Petrolero profiles are provided.
export default function SiteFooter() {
  return (
    <footer className="petrolero-site-footer" aria-label="Подвал сайта Petrolero">
      <div className="petrolero-site-footer-top">
        <div className="petrolero-site-footer-socials" role="group" aria-label="Социальные сети">
          <span className="petrolero-site-footer-social" role="img" aria-label="LinkedIn" title="LinkedIn">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <rect x="2" y="2" width="20" height="20" rx="4" fill="currentColor" />
              <path fill="#151515" d="M6.2 9.5h2.5v8H6.2zm1.25-4a1.45 1.45 0 1 0 0 2.9 1.45 1.45 0 0 0 0-2.9zm3.05 4H13v1.1c.48-.79 1.33-1.35 2.57-1.35 2.62 0 3.03 1.65 3.03 3.8v4.45h-2.5v-4.03c0-.96-.02-2.2-1.35-2.2-1.35 0-1.56 1.04-1.56 2.14v4.09H10.5z" />
            </svg>
          </span>

          <span className="petrolero-site-footer-social" role="img" aria-label="Instagram" title="Instagram">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2.2">
              <rect x="2.3" y="2.3" width="19.4" height="19.4" rx="5.5" />
              <circle cx="12" cy="12" r="4.15" />
              <circle cx="17.75" cy="6.25" r="1.1" fill="currentColor" stroke="none" />
            </svg>
          </span>

          <span className="petrolero-site-footer-social" role="img" aria-label="X" title="X">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path fill="currentColor" d="M17.8 2H21l-7.05 8.05L22.2 22h-6.5l-5.1-7.4L4.12 22H.9l7.53-8.61L.5 2h6.66l4.61 6.7L17.8 2Zm-1.13 18h1.76L6.15 3.9H4.27L16.67 20Z" />
            </svg>
          </span>

          <span className="petrolero-site-footer-social" role="img" aria-label="YouTube" title="YouTube">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <rect x="1.5" y="4.2" width="21" height="15.6" rx="4.4" fill="currentColor" />
              <path d="m10 8 6.5 4-6.5 4V8Z" fill="#151515" />
            </svg>
          </span>

          <span className="petrolero-site-footer-social" role="img" aria-label="Facebook" title="Facebook">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <circle cx="12" cy="12" r="10.5" fill="currentColor" />
              <path fill="#151515" d="M13.9 20v-7h2.45l.37-2.85H13.9V8.33c0-.83.23-1.38 1.41-1.38h1.52V4.4c-.26-.04-1.16-.12-2.2-.12-2.17 0-3.65 1.32-3.65 3.75v2.12H8.55V13h2.43v7Z" />
            </svg>
          </span>
        </div>

        <p className="petrolero-site-footer-credit">© 2026 <strong>Himiko River</strong></p>
      </div>

      <div className="petrolero-site-footer-wordmark" aria-hidden="true">
        <span>PETROLERO</span>
      </div>
    </footer>
  );
}
