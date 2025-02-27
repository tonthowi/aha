import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface HeaderProps {
  currentTab: string;
  onTabChange: (value: string) => void;
}

export function Header({ currentTab, onTabChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-[#e6e6e6]">
      <div className="max-w-4xl mx-auto px-4">
        <Tabs value={currentTab} className="w-full" onValueChange={onTabChange}>
          <TabsList className="flex w-full overflow-x-auto hide-scrollbar">
            <TabsTrigger 
              value="for-you" 
              className="flex-shrink-0 px-4 py-3 text-sm font-medium text-[#666666] data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-2 data-[state=active]:border-black"
            >
              For You
            </TabsTrigger>
            <TabsTrigger 
              value="following" 
              className="flex-shrink-0 px-4 py-3 text-sm font-medium text-[#666666] data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-2 data-[state=active]:border-black"
            >
              Following
            </TabsTrigger>
            <TabsTrigger 
              value="design-inspiration" 
              className="flex-shrink-0 px-4 py-3 text-sm font-medium text-[#666666] data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-2 data-[state=active]:border-black"
            >
              Design Inspiration
            </TabsTrigger>
            <TabsTrigger 
              value="designers" 
              className="flex-shrink-0 px-4 py-3 text-sm font-medium text-[#666666] data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-2 data-[state=active]:border-black"
            >
              Designers to Follow
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </header>
  );
} 