import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { vscodeApi } from '@/lib/vscode-api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

const RTL_LANGUAGES = ['he', 'ar'];

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'en');

  // Apply RTL direction when language changes
  useEffect(() => {
    const isRTL = RTL_LANGUAGES.includes(currentLanguage);
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  const handleLanguageChange = (language: string) => {
    setCurrentLanguage(language);
    localStorage.setItem('specmanager-language', language);
    i18n.changeLanguage(language);
    vscodeApi.setLanguage(language);
  };

  const languages = [
    { code: 'en', label: t('language.english') },
    { code: 'es', label: t('language.spanish') },
    { code: 'he', label: t('language.hebrew') },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          title={t('language.selector')}
          className="h-7 w-7 p-0 hover:bg-[#3c3c3c]"
        >
          <Globe className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-[#252526] border-[#3c3c3c]">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={cn(
              'text-xs cursor-pointer hover:bg-[#3c3c3c]',
              currentLanguage === lang.code && 'bg-[#3c3c3c]'
            )}
          >
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
