
import React from 'react';
import { Copyright } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full bg-background border-t py-3 mt-auto">
      <div className="container max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center sm:justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-1 mb-2 sm:mb-0">
          <Copyright className="h-3.5 w-3.5" />
          <span>{currentYear} Abdulrahman Mohammed (sherlemious)</span>
        </div>
        <div className="flex items-center gap-4">
          <a 
            href="https://github.com/sherlemious" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-foreground"
          >
            GitHub
          </a>
          <a 
            href="https://www.sherlemious.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-foreground"
          >
            Portfolio
          </a>
          <a 
            href="https://www.linkedin.com/in/sherlemious" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-foreground"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
