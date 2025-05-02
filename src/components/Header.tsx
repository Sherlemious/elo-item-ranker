
import React from 'react';
import { Button } from '@/components/ui/button';
import { Github, Globe, Linkedin } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const Header: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <header className="w-full bg-background border-b py-3 px-4 md:px-6">
      <div className="container max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <div className="font-semibold text-lg md:text-xl">ELO Ranker</div>
          <span className="hidden sm:inline-block ml-2 text-xs text-muted-foreground">
            by Abdulrahman Mohammed (sherlemious)
          </span>
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-4">
          <Button 
            variant="ghost" 
            size={isMobile ? "sm" : "default"} 
            className="gap-2"
            asChild
          >
            <a 
              href="https://github.com/sherlemious" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="GitHub Profile"
            >
              <Github className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
              {!isMobile && <span>GitHub</span>}
            </a>
          </Button>
          
          <Button 
            variant="ghost" 
            size={isMobile ? "sm" : "default"} 
            className="gap-2"
            asChild
          >
            <a 
              href="https://www.sherlemious.com" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Portfolio"
            >
              <Globe className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
              {!isMobile && <span>Portfolio</span>}
            </a>
          </Button>
          
          <Button 
            variant="ghost" 
            size={isMobile ? "sm" : "default"} 
            className="gap-2"
            asChild
          >
            <a 
              href="https://www.linkedin.com/in/sherlemious" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <Linkedin className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
              {!isMobile && <span>LinkedIn</span>}
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
