"use client";

import { cn } from "@/lib/utils";
import {
  CheckCircle,
  Clock,
  Star,
  TrendingUp,
  Video,
  Globe,
} from "lucide-react";

const itemsSample = [
  {
    title: "Analytics Dashboard",
    meta: "v2.4.1",
    description:
      "Real-time metrics with AI-powered insights and predictive analytics",
    icon: <TrendingUp className="w-4 h-4 text-blue-500" />,
    status: "Live",
    tags: ["Statistics", "Reports", "AI"],
    colSpan: 2,
    hasPersistentHover: true,
  },
  {
    title: "Task Manager",
    meta: "84 completed",
    description: "Automated workflow management with priority scheduling",
    icon: <CheckCircle className="w-4 h-4 text-emerald-500" />,
    status: "Updated",
    tags: ["Productivity", "Automation"],
  },
  {
    title: "Media Library",
    meta: "12GB used",
    description: "Cloud storage with intelligent content processing",
    icon: <Video className="w-4 h-4 text-orange-500" />,
    tags: ["Storage", "CDN"],
    colSpan: 2,
  },
  {
    title: "Global Network",
    meta: "6 regions",
    description: "Multi-region deployment with edge computing",
    icon: <Globe className="w-4 h-4 text-sky-500" />,
    status: "Beta",
    tags: ["Infrastructure", "Edge"],
  },
];

function BentoGrid({ items = itemsSample, className = "" }) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-4 gap-4 p-4 max-w-7xl mx-auto mb-8", className)}>
      {items.map((item, index) => (
        <div
          key={index}
          className={cn(
            // Base styles with glassmorphism
            "group relative p-5 rounded-xl overflow-hidden transition-all duration-300",
            
            // Glassmorphism effect matching your app theme
            "bg-card/70 backdrop-blur-lg",
            "border border-white/20 dark:border-white/10",
            
            // Hover effects
            "hover:shadow-[0_8px_32px_rgba(31,38,135,0.15)] dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.37)]",
            "hover:-translate-y-1 hover:scale-[1.02]",
            "will-change-transform cursor-pointer",
            
            // Column span
            item.colSpan || "col-span-1",
            item.colSpan === 2 ? "md:col-span-2" : "",
            
            // Persistent hover state
            {
              "shadow-[0_8px_32px_rgba(31,38,135,0.15)] -translate-y-1 scale-[1.02]":
                item.hasPersistentHover,
              "dark:shadow-[0_8px_32px_rgba(0,0,0,0.37)]":
                item.hasPersistentHover,
            }
          )}
        >
          {/* Dot pattern overlay */}
          <div
            className={cn(
              "absolute inset-0 transition-opacity duration-300",
              item.hasPersistentHover
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100"
            )}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:4px_4px]" />
          </div>

          {/* Content */}
          <div className="relative flex flex-col space-y-3 z-10">
            {/* Header with icon and status */}
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-primary/10 to-success/10 dark:from-primary/20 dark:to-success/20 group-hover:from-primary/20 group-hover:to-success/20 transition-all duration-300 shadow-sm">
                {item.icon}
              </div>
              <span
                className={cn(
                  "text-xs font-medium px-3 py-1.5 rounded-lg backdrop-blur-sm",
                  "bg-gradient-to-r from-primary/10 to-success/10",
                  "text-foreground/80",
                  "transition-all duration-300",
                  "group-hover:from-primary/20 group-hover:to-success/20",
                  "group-hover:shadow-sm"
                )}
              >
                {item.status || "Active"}
              </span>
            </div>

            {/* Title and description */}
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground tracking-tight text-base leading-tight">
                {item.title}
                {item.meta && (
                  <span className="ml-2 text-xs text-muted-foreground font-normal">
                    {item.meta}
                  </span>
                )}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-normal">
                {item.description}
              </p>
            </div>

            {/* Tags and CTA */}
            <div className="flex items-center justify-between mt-2 pt-2">
              <div className="flex items-center gap-2 flex-wrap">
                {item.tags?.map((tag, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-md bg-gradient-to-r from-primary/10 to-success/10 text-foreground/70 backdrop-blur-sm transition-all duration-200 hover:from-primary/20 hover:to-success/20 hover:shadow-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-all duration-300 font-medium whitespace-nowrap ml-2">
                {item.cta || "Explore →"}
              </span>
            </div>
          </div>

          {/* Gradient border effect */}
          <div
            className={cn(
              "absolute inset-0 -z-10 rounded-xl",
              "bg-gradient-to-br from-primary/5 via-transparent to-success/5",
              "dark:from-primary/10 dark:to-success/10",
              "transition-opacity duration-300",
              item.hasPersistentHover
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100"
            )}
          />
        </div>
      ))}
    </div>
  );
}

export { BentoGrid };
