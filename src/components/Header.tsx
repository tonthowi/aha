import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface HeaderProps {
  currentTab: string;
  onTabChange: (value: string) => void;
}

export function Header({ currentTab, onTabChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b">
      <div className="max-w-2xl mx-auto">
        <Tabs value={currentTab} className="w-full" onValueChange={onTabChange}>
          <TabsList className="flex w-full overflow-x-auto hide-scrollbar">
            <TabsTrigger 
              value="for-you" 
              className="flex-shrink-0 px-4 py-3 text-sm font-medium data-[state=active]:font-semibold data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
            >
              For You
            </TabsTrigger>
            <TabsTrigger 
              value="following" 
              className="flex-shrink-0 px-4 py-3 text-sm font-medium data-[state=active]:font-semibold data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
            >
              Following
            </TabsTrigger>
            <TabsTrigger 
              value="design-inspiration" 
              className="flex-shrink-0 px-4 py-3 text-sm font-medium data-[state=active]:font-semibold data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
            >
              Design Inspiration
            </TabsTrigger>
            <TabsTrigger 
              value="designers" 
              className="flex-shrink-0 px-4 py-3 text-sm font-medium data-[state=active]:font-semibold data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
            >
              Designers to Follow
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </header>
  );
} 