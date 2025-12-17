import { cn } from "@/lib/utils";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "h-6 w-6 border-2",
  md: "h-12 w-12 border-4",
  lg: "h-16 w-16 border-4",
};

export function Loader({ size = "md", text, fullScreen = false, className }: LoaderProps) {
  const content = (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className="relative">
        <div className={cn("rounded-full border-muted", sizeClasses[size])}></div>
        <div
          className={cn(
            "absolute top-0 left-0 rounded-full border-primary border-t-transparent animate-spin",
            sizeClasses[size]
          )}
        ></div>
      </div>
      {text && <p className="text-sm text-muted-foreground animate-pulse">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        {content}
      </div>
    );
  }

  return content;
}
