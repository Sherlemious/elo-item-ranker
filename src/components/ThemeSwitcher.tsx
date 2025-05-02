
import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';

const ThemeSwitcher: React.FC = () => {
  const { state, setTheme } = useAppContext();
  
  const themes = [
    { id: 'default', name: 'Blue', color: 'bg-blue-500' },
    { id: 'dark', name: 'Dark', color: 'bg-gray-800' },
    { id: 'purple', name: 'Purple', color: 'bg-purple-500' },
    { id: 'amber', name: 'Amber', color: 'bg-amber-500' },
    { id: 'rose', name: 'Rose', color: 'bg-rose-500' }
  ];
  
  return (
    <div className="fixed bottom-4 right-4 bg-card rounded-lg shadow-lg p-3 flex gap-2 z-50">
      {themes.map(theme => (
        <Button
          key={theme.id}
          variant="ghost"
          size="icon"
          className={`relative w-8 h-8 rounded-full ${theme.color} ${
            state.currentTheme === theme.id ? 'ring-2 ring-primary ring-offset-2' : ''
          }`}
          onClick={() => setTheme(theme.id as any)}
          title={theme.name}
          aria-label={`Switch to ${theme.name} theme`}
        >
          <span className="sr-only">{theme.name}</span>
        </Button>
      ))}
    </div>
  );
};

export default ThemeSwitcher;
