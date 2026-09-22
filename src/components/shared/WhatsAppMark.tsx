export function WhatsAppMark({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path
        d="M12 4.6a7.4 7.4 0 0 0-6.4 11.1L4.8 19.2l3.6-.9A7.4 7.4 0 1 0 12 4.6Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M9.3 9.6c.2 1.3 1.5 2.8 2.7 3.4.4.2.8.1 1-.2l.5-.6c.2-.2.4-.2.7-.1l1.2.5c.3.1.4.4.3.7-.2.7-.9 1.3-1.6 1.3-2.2 0-4.6-2.3-5.1-4.4-.2-.7.1-1.3.7-1.6.2-.1.5 0 .6.2l.3.5c.1.2.1.4-.1.6l-.2.3Z"
        fill="currentColor"
      />
    </svg>
  );
}
