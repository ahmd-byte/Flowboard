import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'dark', // 'dark' or 'light'
      
      toggleTheme: () => {
        const newTheme = get().theme === 'dark' ? 'light' : 'dark';
        set({ theme: newTheme });
        
        // Apply theme to document and body
        const html = document.documentElement;
        const body = document.body;
        
        if (newTheme === 'dark') {
          html.classList.add('dark');
          html.classList.remove('light');
          body.classList.add('dark');
          body.classList.remove('light');
        } else {
          html.classList.add('light');
          html.classList.remove('dark');
          body.classList.add('light');
          body.classList.remove('dark');
        }
      },
      
      setTheme: (theme) => {
        set({ theme });
        const html = document.documentElement;
        const body = document.body;
        
        if (theme === 'dark') {
          html.classList.add('dark');
          html.classList.remove('light');
          body.classList.add('dark');
          body.classList.remove('light');
        } else {
          html.classList.add('light');
          html.classList.remove('dark');
          body.classList.add('light');
          body.classList.remove('dark');
        }
      },
      
      // Initialize theme on app load
      initTheme: () => {
        const theme = get().theme;
        const html = document.documentElement;
        const body = document.body;
        
        if (theme === 'dark') {
          html.classList.add('dark');
          html.classList.remove('light');
          body.classList.add('dark');
          body.classList.remove('light');
        } else {
          html.classList.add('light');
          html.classList.remove('dark');
          body.classList.add('light');
          body.classList.remove('dark');
        }
      }
    }),
    {
      name: 'flowboard-theme',
    }
  )
);

export default useThemeStore;


