
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Languages, ArrowRightLeft, Volume2, Copy } from 'lucide-react';

export const Translator = () => {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('ar');
  const [isTranslating, setIsTranslating] = useState(false);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' },
    { code: 'fr', name: 'French' },
    { code: 'es', name: 'Spanish' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' }
  ];

  const commonPhrases = [
    { en: "Hello, how are you?", ar: "مرحبا، كيف حالك؟" },
    { en: "Where is the nearest hotel?", ar: "أين أقرب فندق؟" },
    { en: "How much does this cost?", ar: "كم يكلف هذا؟" },
    { en: "Can you help me?", ar: "هل يمكنك مساعدتي؟" },
    { en: "Thank you very much!", ar: "شكرا جزيلا!" },
    { en: "Excuse me", ar: "عذراً" }
  ];

  const translateText = async () => {
    if (!sourceText.trim()) return;
    
    setIsTranslating(true);
    // Simulate translation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock translation - in real app would use actual translation service
    const mockTranslations: any = {
      'en-ar': {
        'Hello': 'مرحبا',
        'Thank you': 'شكرا لك',
        'How are you?': 'كيف حالك؟',
        'Where is the hotel?': 'أين الفندق؟'
      }
    };
    
    const key = `${sourceLang}-${targetLang}`;
    setTranslatedText(mockTranslations[key]?.[sourceText] || `[Translated: ${sourceText}]`);
    setIsTranslating(false);
  };

  const swapLanguages = () => {
    const tempLang = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(tempLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const speakText = (text: string, lang: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Language Translator</h2>
        <p className="text-muted-foreground">Communicate easily with locals</p>
      </div>

      {/* Main Translator */}
      <Card className="travel-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Languages className="w-5 h-5" />
            <span>Text Translator</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Language Selection */}
          <div className="flex items-center space-x-4">
            <Select value={sourceLang} onValueChange={setSourceLang}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="icon"
              onClick={swapLanguages}
            >
              <ArrowRightLeft className="w-4 h-4" />
            </Button>
            
            <Select value={targetLang} onValueChange={setTargetLang}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Text Input/Output */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Enter text</span>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => speakText(sourceText, sourceLang)}
                    disabled={!sourceText}
                  >
                    <Volume2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyText(sourceText)}
                    disabled={!sourceText}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <Textarea
                placeholder="Type text to translate..."
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                className="h-32 resize-none"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Translation</span>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => speakText(translatedText, targetLang)}
                    disabled={!translatedText}
                  >
                    <Volume2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyText(translatedText)}
                    disabled={!translatedText}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <Textarea
                value={translatedText}
                readOnly
                className="h-32 resize-none bg-muted"
                placeholder="Translation will appear here..."
              />
            </div>
          </div>

          <Button
            onClick={translateText}
            disabled={!sourceText.trim() || isTranslating}
            className="w-full btn-travel"
          >
            {isTranslating ? 'Translating...' : 'Translate'}
          </Button>
        </CardContent>
      </Card>

      {/* Common Phrases */}
      <Card className="travel-card">
        <CardHeader>
          <CardTitle>Common Travel Phrases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {commonPhrases.map((phrase, index) => (
              <Card key={index} className="p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="space-y-2">
                  <p className="font-medium">{phrase.en}</p>
                  <p className="text-muted-foreground text-right">{phrase.ar}</p>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
