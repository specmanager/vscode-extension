import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Globe } from 'lucide-react';
import { useEffect } from 'react';

const languages = [
  { code: 'en', name: 'English', dir: 'ltr' },
  { code: 'he', name: 'עברית', dir: 'rtl' },
  { code: 'es', name: 'Español', dir: 'ltr' },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const currentLang = languages.find(lang => lang.code === i18n.language);
    if (currentLang) {
      document.documentElement.dir = currentLang.dir;
      document.documentElement.lang = currentLang.code;
    }
  }, [i18n.language]);

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    const lang = languages.find(l => l.code === langCode);
    if (lang) {
      document.documentElement.dir = lang.dir;
      document.documentElement.lang = lang.code;
    }
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          {currentLanguage?.name}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map(lang => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={i18n.language === lang.code ? 'bg-accent' : ''}
          >
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
