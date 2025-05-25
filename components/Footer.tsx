// components/Footer.tsx
"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-tborder-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60 py-4 px-4 text-sm flex justify-end items-center space-x-2">
        <span className="text-gray-700 dark:text-gray-300">Built by </span>
        <Link
          href="https://x.com/0xkar4n"
          className="underline text-blue-600 dark:text-blue-400"
          target="_blank"
          rel="noopener noreferrer"
        >
          Karan
        </Link>
      
    </footer>
  );
}