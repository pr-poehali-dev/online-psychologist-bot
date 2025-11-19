import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import BreathingTimer from '@/components/BreathingTimer';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface MoodEntry {
  id: string;
  mood: string;
  emoji: string;
  note: string;
  date: Date;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Здравствуйте! Я ваш персональный AI-психолог. Я здесь, чтобы выслушать и поддержать вас в любое время. Расскажите, что вас беспокоит?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const [showBreathingTimer, setShowBreathingTimer] = useState(false);
  const [selectedTechnique, setSelectedTechnique] = useState<{ title: string; inhale: number; hold: number; exhale: number } | null>(null);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [selectedMood, setSelectedMood] = useState<{ emoji: string; label: string } | null>(null);
  const [moodNote, setMoodNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = 'https://functions.poehali.dev/28b7b01a-34bb-4242-826a-d91aa573fd24';

  useEffect(() => {
    loadMoodEntries();
  }, []);

  const loadMoodEntries = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      const entries = data.entries.map((entry: any) => ({
        ...entry,
        date: new Date(entry.date)
      }));
      setMoodEntries(entries);
    } catch (error) {
      console.error('Error loading mood entries:', error);
    }
  };

  const saveMoodEntry = async () => {
    if (!selectedMood) return;

    setIsLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mood: selectedMood.label,
          emoji: selectedMood.emoji,
          note: moodNote
        })
      });

      const newEntry = await response.json();
      setMoodEntries([{ ...newEntry, date: new Date(newEntry.date) }, ...moodEntries]);
      setSelectedMood(null);
      setMoodNote('');
    } catch (error) {
      console.error('Error saving mood entry:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages([...messages, userMessage]);
    setInputMessage('');

    setTimeout(() => {
      const responses = [
        'Я понимаю ваши чувства. Это совершенно нормально чувствовать себя так. Расскажите мне больше о том, что происходит?',
        'Спасибо, что поделились этим со мной. Давайте разберемся вместе. Как долго вы испытываете эти эмоции?',
        'Я слышу вас. Ваши переживания важны. Что, по-вашему, могло бы помочь вам почувствовать себя лучше?',
        'Это звучит непросто. Помните, что обращение за поддержкой - это признак силы. Что вы уже пробовали для улучшения ситуации?'
      ];
      
      const aiResponse: Message = {
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const relaxationTechniques = [
    {
      title: 'Дыхание 4-7-8',
      description: 'Вдох на 4 счета, задержка на 7, выдох на 8',
      icon: 'Wind',
      duration: '5 мин',
      breathing: { inhale: 4, hold: 7, exhale: 8 }
    },
    {
      title: 'Квадратное дыхание',
      description: 'Вдох 4, задержка 4, выдох 4, пауза 4',
      icon: 'Square',
      duration: '5 мин',
      breathing: { inhale: 4, hold: 4, exhale: 4 }
    },
    {
      title: 'Глубокое дыхание',
      description: 'Медленный вдох 6 счетов, выдох 6 счетов',
      icon: 'Heart',
      duration: '8 мин',
      breathing: { inhale: 6, hold: 0, exhale: 6 }
    },
    {
      title: 'Быстрое успокоение',
      description: 'Вдох на 3, задержка 3, выдох на 6',
      icon: 'Sparkles',
      duration: '3 мин',
      breathing: { inhale: 3, hold: 3, exhale: 6 }
    }
  ];

  const handleStartBreathing = (technique: typeof relaxationTechniques[0]) => {
    setSelectedTechnique({
      title: technique.title,
      inhale: technique.breathing.inhale,
      hold: technique.breathing.hold,
      exhale: technique.breathing.exhale
    });
    setShowBreathingTimer(true);
  };

  const emergencyContacts = [
    { name: 'Телефон доверия', number: '8-800-2000-122', available: '24/7' },
    { name: 'Психологическая помощь', number: '051', available: '24/7' },
    { name: 'Служба экстренной помощи', number: '112', available: '24/7' }
  ];

  const resources = [
    {
      title: 'Как справиться с тревогой',
      category: 'Тревожность',
      readTime: '7 мин'
    },
    {
      title: 'Техники работы со стрессом',
      category: 'Стресс',
      readTime: '5 мин'
    },
    {
      title: 'Улучшение качества сна',
      category: 'Сон',
      readTime: '10 мин'
    },
    {
      title: 'Развитие эмоционального интеллекта',
      category: 'Развитие',
      readTime: '12 мин'
    }
  ];

  const moods = [
    { emoji: '😊', label: 'Радостно' },
    { emoji: '😌', label: 'Спокойно' },
    { emoji: '😔', label: 'Грустно' },
    { emoji: '😰', label: 'Тревожно' },
    { emoji: '😡', label: 'Сердито' },
    { emoji: '😴', label: 'Устало' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8 text-center animate-fade-in">
          <h1 className="text-4xl font-bold text-primary mb-2">Пространство заботы</h1>
          <p className="text-muted-foreground text-lg">Ваш личный психолог онлайн</p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-scale-in">
          <TabsList className="grid w-full grid-cols-5 mb-6 h-auto p-1">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <Icon name="MessageCircle" size={18} />
              <span className="hidden sm:inline">Чат</span>
            </TabsTrigger>
            <TabsTrigger value="mood" className="flex items-center gap-2">
              <Icon name="Heart" size={18} />
              <span className="hidden sm:inline">Дневник</span>
            </TabsTrigger>
            <TabsTrigger value="relax" className="flex items-center gap-2">
              <Icon name="Sparkles" size={18} />
              <span className="hidden sm:inline">Релаксация</span>
            </TabsTrigger>
            <TabsTrigger value="emergency" className="flex items-center gap-2">
              <Icon name="Phone" size={18} />
              <span className="hidden sm:inline">SOS</span>
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <Icon name="BookOpen" size={18} />
              <span className="hidden sm:inline">Ресурсы</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="animate-enter">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Bot" size={24} className="text-primary" />
                  AI-консультант
                </CardTitle>
                <CardDescription>Круглосуточная поддержка и первичная консультация</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4 mb-4">
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary text-secondary-foreground'
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{message.content}</p>
                          <span className="text-xs opacity-70 mt-1 block">
                            {message.timestamp.toLocaleTimeString('ru-RU', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="flex gap-2">
                  <Input
                    placeholder="Напишите о своих чувствах..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} size="icon">
                    <Icon name="Send" size={20} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mood" className="animate-enter">
            <div className="grid gap-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Как вы себя чувствуете сегодня?</CardTitle>
                  <CardDescription>Отслеживайте свое эмоциональное состояние</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
                    {moods.map((mood) => (
                      <Button
                        key={mood.label}
                        variant={selectedMood?.label === mood.label ? 'default' : 'outline'}
                        className="h-24 flex flex-col gap-2 hover:bg-secondary transition-all hover:scale-105"
                        onClick={() => setSelectedMood(mood)}
                      >
                        <span className="text-4xl">{mood.emoji}</span>
                        <span className="text-xs">{mood.label}</span>
                      </Button>
                    ))}
                  </div>
                  <Input 
                    placeholder="Добавьте заметку о вашем состоянии..." 
                    className="mb-3"
                    value={moodNote}
                    onChange={(e) => setMoodNote(e.target.value)}
                  />
                  <Button 
                    className="w-full" 
                    onClick={saveMoodEntry}
                    disabled={!selectedMood || isLoading}
                  >
                    <Icon name="Plus" size={18} className="mr-2" />
                    {isLoading ? 'Сохранение...' : 'Сохранить запись'}
                  </Button>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>История записей</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-4">
                        {moodEntries.map((entry) => (
                          <div key={entry.id} className="flex items-start gap-4 p-4 rounded-lg bg-secondary/50">
                            <span className="text-4xl">{entry.emoji}</span>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium">{entry.mood}</span>
                                <span className="text-xs text-muted-foreground">
                                  {entry.date.toLocaleDateString('ru-RU')}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">{entry.note}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>Статистика настроения</CardTitle>
                    <CardDescription>Последние 7 дней</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(() => {
                        const moodCounts = moodEntries.reduce((acc, entry) => {
                          acc[entry.mood] = (acc[entry.mood] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>);

                        const maxCount = Math.max(...Object.values(moodCounts));

                        return Object.entries(moodCounts).map(([mood, count]) => {
                          const emoji = moodEntries.find(e => e.mood === mood)?.emoji || '😊';
                          const percentage = (count / moodEntries.length) * 100;
                          const barWidth = (count / maxCount) * 100;

                          return (
                            <div key={mood} className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2">
                                  <span className="text-2xl">{emoji}</span>
                                  <span className="font-medium">{mood}</span>
                                </span>
                                <span className="text-muted-foreground">
                                  {count} {count === 1 ? 'день' : 'дней'} ({percentage.toFixed(0)}%)
                                </span>
                              </div>
                              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500"
                                  style={{ width: `${barWidth}%` }}
                                />
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                    
                    <Separator className="my-6" />
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5">
                        <span className="text-sm font-medium">Всего записей</span>
                        <Badge variant="secondary" className="text-base">
                          {moodEntries.length}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5">
                        <span className="text-sm font-medium">Самое частое настроение</span>
                        <Badge variant="secondary" className="text-base">
                          {(() => {
                            const moodCounts = moodEntries.reduce((acc, entry) => {
                              acc[entry.mood] = (acc[entry.mood] || 0) + 1;
                              return acc;
                            }, {} as Record<string, number>);
                            const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
                            const emoji = moodEntries.find(e => e.mood === topMood[0])?.emoji;
                            return `${emoji} ${topMood[0]}`;
                          })()}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="relax" className="animate-enter">
            <div className="grid md:grid-cols-2 gap-6">
              {relaxationTechniques.map((technique, index) => (
                <Card key={index} className="shadow-lg hover:shadow-xl transition-all hover:scale-105">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-full bg-primary/10">
                          <Icon name={technique.icon as any} size={24} className="text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{technique.title}</CardTitle>
                          <Badge variant="secondary" className="mt-1">
                            {technique.duration}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{technique.description}</p>
                    <Button className="w-full" onClick={() => handleStartBreathing(technique)}>
                      <Icon name="Play" size={18} className="mr-2" />
                      Начать практику
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="emergency" className="animate-enter">
            <Card className="shadow-lg border-destructive/50">
              <CardHeader className="bg-destructive/5">
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <Icon name="AlertCircle" size={24} />
                  Экстренная помощь
                </CardTitle>
                <CardDescription>
                  Если вам нужна немедленная помощь, позвоните по одному из этих номеров
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {emergencyContacts.map((contact, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">{contact.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Доступно: {contact.available}
                          </p>
                        </div>
                        <Button size="lg" className="gap-2">
                          <Icon name="Phone" size={20} />
                          {contact.number}
                        </Button>
                      </div>
                      {index < emergencyContacts.length - 1 && <Separator className="my-4" />}
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm text-muted-foreground">
                    <Icon name="Info" size={16} className="inline mr-2" />
                    Если вы чувствуете, что находитесь в опасности или переживаете кризис, не
                    откладывайте обращение за профессиональной помощью.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="animate-enter">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Полезные материалы</CardTitle>
                <CardDescription>Статьи и рекомендации от психологов</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {resources.map((resource, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <Icon name="FileText" size={20} className="text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                            {resource.title}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <Badge variant="outline">{resource.category}</Badge>
                            <span className="flex items-center gap-1">
                              <Icon name="Clock" size={14} />
                              {resource.readTime}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Icon name="ChevronRight" size={20} className="text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {showBreathingTimer && selectedTechnique && (
        <BreathingTimer
          technique={selectedTechnique}
          onClose={() => setShowBreathingTimer(false)}
        />
      )}
    </div>
  );
};

export default Index;