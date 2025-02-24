'use client';

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo and Copyright */}
          <div className="flex items-center space-x-4">
          <img 
              src="/kriscent-logo.png" 
              alt="Kriscent Logo" 
              className="h-7 w-auto"
            />
            <span className="text-sm font-medium text-slate-600">
              Designed and Product by{" "}
              <a
                href="https://kriscent.in"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-primary/80 to-blue-600/80 bg-clip-text text-transparent"
              >
                
                Kriscent Techno Hub Pvt. Ltd.
              </a>
            </span>
            

            
            <div className="h-5 w-px bg-gradient-to-b from-slate-200 via-slate-300 to-slate-200" />
            <span className="text-sm font-medium text-slate-600">
              <span className="bg-gradient-to-r from-primary/80 to-blue-600/80 bg-clip-text text-transparent ">{String.fromCharCode(169)}</span>{" "}
              <span className="bg-gradient-to-r from-primary/80 to-blue-600/80 bg-clip-text text-transparent">
                2025 
              </span>
            </span>
          </div>
          
          {/* Links */}
          <div className="flex items-center space-x-8">
            <a 
              href="https://www.kriscent.in/privacy" 
              className="text-sm font-medium text-slate-600 hover:text-primary transition-colors relative group"
            >
              Privacy Policy
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
            </a>
            <a 
              href="https://www.kriscent.in/terms-conditions" 
              className="text-sm font-medium text-slate-600 hover:text-primary transition-colors relative group"
            >
              Terms of Service
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
            </a>
            <a 
              href="https://www.kriscent.in/contact" 
              className="text-sm font-medium text-slate-600 hover:text-primary transition-colors relative group"
            >
              Contact Us
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
