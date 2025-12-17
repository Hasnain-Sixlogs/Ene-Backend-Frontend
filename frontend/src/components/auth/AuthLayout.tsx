import { ReactNode } from "react";
import logo from "@/assets/logo.svg";

interface AuthLayoutProps {
  children: ReactNode;
  showIllustration?: boolean;
}

export function AuthLayout({ children, showIllustration = false }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-3/5 auth-panel items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-info/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 text-center">
          {showIllustration ? (
            <div className="animate-fade-up">
              {/* Dashboard Preview Illustration */}
              <div className="bg-card rounded-2xl shadow-2xl p-6 max-w-md mx-auto transform hover:scale-105 transition-transform duration-500">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-info" />
                  <div className="w-3 h-3 rounded-full bg-warning" />
                  <div className="w-3 h-3 rounded-full bg-accent" />
                </div>
                
                {/* Activity Chart */}
                <div className="bg-muted/50 rounded-lg p-4 mb-4">
                  <p className="text-sm font-semibold text-foreground mb-3">Activity</p>
                  <div className="flex items-end gap-2 h-24">
                    {[40, 60, 45, 70, 85, 65, 50].map((height, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-info rounded-t transition-all duration-500"
                        style={{ height: `${height}%`, animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                      <span key={i}>{day}</span>
                    ))}
                  </div>
                </div>

                {/* Progress Ring */}
                <div className="flex items-center gap-4 bg-muted/50 rounded-lg p-4">
                  <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 transform -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        className="stroke-muted"
                        strokeWidth="6"
                        fill="none"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        className="stroke-info"
                        strokeWidth="6"
                        fill="none"
                        strokeDasharray={`${70 * 1.76} ${100 * 1.76}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">
                      70%
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-2xl font-bold text-foreground">$1,235.00</p>
                    <p className="text-sm text-accent font-medium">Completed</p>
                  </div>
                </div>
              </div>
              
              <h2 className="mt-8 text-2xl font-bold text-white">
                Manage your education platform
              </h2>
              <p className="mt-2 text-white/70">
                Track users, content, and engagement in one place.
              </p>
            </div>
          ) : (
            <div className="animate-fade-up">
              {/* Logo */}
              <div className="flex items-center justify-center mb-8">
                <img src={logo} alt="Every Nation Education" className="h-20 w-auto" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                Welcome to Every Nation Education
              </h2>
              <p className="mt-2 text-white/70">
                Empowering faith-based learning worldwide
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-8 bg-card">
        <div className="w-full max-w-md animate-fade-in">
          {children}
        </div>
      </div>
    </div>
  );
}
