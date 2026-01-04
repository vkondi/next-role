/**
 * CareerPathsCarousel Component
 * Horizontal scrollable carousel of minimal career path cards
 */

import { useRef, useState } from "react";
import { CareerPathCardMinimal } from "./CareerPathCardMinimal";
import type { CareerPathMinimal } from "@/lib/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CareerPathsCarouselProps {
  paths: CareerPathMinimal[];
  selectedPathId: string | null;
  onSelect: (pathId: string) => void;
  isLoading?: boolean;
}

export function CareerPathsCarousel({
  paths,
  selectedPathId,
  onSelect,
  isLoading = false,
}: CareerPathsCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(paths.length > 1);

  const checkScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 400;
    const newScrollLeft =
      scrollContainerRef.current.scrollLeft +
      (direction === "left" ? -scrollAmount : scrollAmount);
    scrollContainerRef.current.scrollTo({
      left: newScrollLeft,
      behavior: "smooth",
    });
    setTimeout(checkScroll, 300);
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Title */}
      <div>
        <h2 className="heading-2 text-2xl sm:text-3xl md:text-4xl">Recommended Career Paths</h2>
        <p className="text-subtitle text-slate-600 text-sm sm:text-base mt-1 sm:mt-2">
          Select a path to explore in detail
        </p>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="card text-center">
          <div className="inline-flex items-center justify-center w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-emerald-600 animate-pulse" />
          <p className="mt-3 sm:mt-4 text-base sm:text-lg font-semibold text-slate-900">
            Analyzing your profile...
          </p>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5 sm:mt-1">
            Finding the best career paths for you
          </p>
        </div>
      )}

      {/* Carousel */}
      {!isLoading && paths.length > 0 && (
        <div className="relative group">
          {/* Scroll Buttons - Only show on larger screens */}
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white rounded-full p-1.5 sm:p-2 shadow-md hover:bg-slate-50 transition-colors hidden sm:flex"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 sm:w-5 h-4 sm:h-5 text-slate-700" />
            </button>
          )}

          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white rounded-full p-1.5 sm:p-2 shadow-md hover:bg-slate-50 transition-colors hidden sm:flex"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 sm:w-5 h-4 sm:h-5 text-slate-700" />
            </button>
          )}

          {/* Cards Container - with responsive padding for buttons */}
          <div className="px-0 sm:px-12">
            <div
              ref={scrollContainerRef}
              onScroll={checkScroll}
              className="flex gap-3 sm:gap-4 overflow-x-auto scroll-smooth pb-2 [-webkit-scrollbar:none] [scrollbar-width:none]"
              style={{ scrollBehavior: "smooth" }}
            >
              {paths.map((path) => (
                <CareerPathCardMinimal
                  key={path.roleId}
                  path={path}
                  isSelected={selectedPathId === path.roleId}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && paths.length === 0 && (
        <div className="card text-center">
          <p className="text-slate-600 text-sm sm:text-base">No career paths available</p>
        </div>
      )}

      {/* Selection guidance */}
      {!isLoading && paths.length > 0 && !selectedPathId && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 text-center">
          <p className="text-xs sm:text-sm font-semibold text-blue-900">
            👉 Select a career path to view detailed analysis
          </p>
        </div>
      )}
    </div>
  );
}
