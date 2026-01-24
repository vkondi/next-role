'use client';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-200 mt-8 sm:mt-12">
      <div className="container py-6 sm:py-8">
        <p className="text-center text-xs sm:text-sm text-slate-600">
          Copyright © {currentYear} Vishwajeet Kondi. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
