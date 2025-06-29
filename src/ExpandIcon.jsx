export default function ExpandIcon({ className = "", isExpanded = false }) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`cursor-pointer transition-transform ${isExpanded ? "rotate-45" : ""} ${className}`}
    >
      <rect
        x="14.9434"
        y="10.001"
        width="2.112"
        height="12"
        rx="1.056"
        fill="#767A86"
      />
      <rect
        x="22"
        y="14.9443"
        width="2.112"
        height="12"
        rx="1.056"
        transform="rotate(90 22 14.9443)"
        fill="#767A86"
      />
    </svg>
  );
}
