export default function InfoIcon({ className = "" }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`cursor-pointer ${className}`}
    >
      <path
        d="M10.61 8.1a.25.25 0 0 1 .25.238l.294 5.983a.25.25 0 0 1-.25.262H9.137a.25.25 0 0 1-.25-.261l.283-5.984a.25.25 0 0 1 .25-.238zM10.778 5.417a.25.25 0 0 1 .25.25v1.297a.25.25 0 0 1-.25.25H9.25a.25.25 0 0 1-.25-.25V5.667a.25.25 0 0 1 .25-.25z"
        fillRule="evenodd"
        clipRule="evenodd"
        fill="currentColor"
      />
    </svg>
  );
}
