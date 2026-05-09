// src/Branding.tsx

interface BrandingProps {
  color?: string;
}

/**
 * Subtle "Built with NFSFU234TourGuide" badge.
 * Rendered inside the welcome screen when showBranding={true} (default).
 * Never appears on individual step tooltips.
 */
export default function Branding({ color = '#ffffff' }: BrandingProps) {
  return (
    <a
      href="https://tour-guide.nforshifu234dev.com"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'block',
        textAlign: 'center',
        marginTop: '16px',
        fontSize: '11px',
        color,
        opacity: 0.35,
        textDecoration: 'none',
        letterSpacing: '0.02em',
        transition: 'opacity 0.2s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.65')}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.35')}
    >
      Built with NFSFU234TourGuide
    </a>
  );
}