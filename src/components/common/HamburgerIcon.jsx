function HamburgerIcon({ className = "w-5 h-5" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Top line - full width */}
      <rect x="3" y="6" width="18" height="2" rx="1" fill="currentColor" />
      {/* Middle line - shorter */}
      <rect x="6" y="11" width="12" height="2" rx="1" fill="currentColor" />
      {/* Bottom line - full width */}
      <rect x="3" y="16" width="18" height="2" rx="1" fill="currentColor" />
    </svg>
  );
}

export default HamburgerIcon;
