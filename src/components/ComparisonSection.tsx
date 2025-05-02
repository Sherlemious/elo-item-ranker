
import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const ComparisonSection: React.FC = () => {
  const { getCurrentPair, recordComparison, getProgress, showResults, resetToInput } = useAppContext();
  const isMobile = useIsMobile();
  
  const currentPair = getCurrentPair();
  const { current, recommended, total } = getProgress();
  
  const progressPercentage = Math.min(100, (current / recommended) * 100);
  const canShowResults = current >= recommended;
  
  return (
    <div className="container max-w-4xl mx-auto px-4 py-4 md:py-8 space-y-4 md:space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={resetToInput}
          className="flex items-center gap-2"
          size={isMobile ? "sm" : "default"}
        >
          <ArrowLeft className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
          {isMobile ? 'Back' : 'Back to Items'}
        </Button>
        
        <div className={`text-${isMobile ? 'xs' : 'sm'} text-muted-foreground`}>
          {current} of {recommended}+
        </div>
      </div>
      
      <div className="space-y-2">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-center">Choose Which is Better</h1>
        <p className="text-center text-sm md:text-base text-muted-foreground">
          Select the item you prefer
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="bg-muted p-3 md:p-4 rounded-lg">
          <div className="flex items-center justify-between text-xs md:text-sm mb-2">
            <span>Progress</span>
            <span>{current} of {recommended}+ comparisons</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Minimum</span>
            <span>Recommended</span>
          </div>
        </div>
        
        {currentPair ? (
          <div className={`grid grid-cols-1 ${isMobile ? 'gap-3' : 'md:grid-cols-2 gap-6'}`}>
            {isMobile ? (
              <>
                <Card 
                  className="overflow-hidden border-2 hover:border-primary transition-colors cursor-pointer"
                  onClick={() => recordComparison(0)}
                >
                  <CardHeader className="p-3 bg-muted/50">
                    <CardTitle className="text-center text-base">Option A</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 flex items-center justify-center min-h-[100px]">
                    <h3 className="text-lg font-semibold text-center">{currentPair[0].name}</h3>
                  </CardContent>
                </Card>
                
                <div className="flex justify-center items-center py-1">
                  <span className="text-xs text-muted-foreground">VS</span>
                </div>
                
                <Card 
                  className="overflow-hidden border-2 hover:border-primary transition-colors cursor-pointer"
                  onClick={() => recordComparison(1)}
                >
                  <CardHeader className="p-3 bg-muted/50">
                    <CardTitle className="text-center text-base">Option B</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 flex items-center justify-center min-h-[100px]">
                    <h3 className="text-lg font-semibold text-center">{currentPair[1].name}</h3>
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                <Card 
                  className="overflow-hidden border-2 hover:border-primary transition-colors cursor-pointer"
                  onClick={() => recordComparison(0)}
                >
                  <CardHeader className="p-4 bg-muted/50">
                    <CardTitle className="text-center text-lg">Option A</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 flex items-center justify-center min-h-[150px]">
                    <h3 className="text-xl font-semibold text-center">{currentPair[0].name}</h3>
                  </CardContent>
                </Card>
                
                <Card 
                  className="overflow-hidden border-2 hover:border-primary transition-colors cursor-pointer"
                  onClick={() => recordComparison(1)}
                >
                  <CardHeader className="p-4 bg-muted/50">
                    <CardTitle className="text-center text-lg">Option B</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 flex items-center justify-center min-h-[150px]">
                    <h3 className="text-xl font-semibold text-center">{currentPair[1].name}</h3>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="mb-4">There are no more unique pairs to compare!</p>
              <Button onClick={showResults}>View Results</Button>
            </CardContent>
          </Card>
        )}
        
        <div className="flex justify-center pt-2 md:pt-4">
          {canShowResults && currentPair && (
            <Button
              onClick={showResults}
              variant="outline"
              size={isMobile ? "default" : "lg"}
            >
              {isMobile ? "Show Results" : "Show Results Now"}
            </Button>
          )}
        </div>
        
        <div className="text-center text-xs md:text-sm text-muted-foreground">
          <p>You've made {current} comparison{current !== 1 ? 's' : ''} out of {total} possible pairs.</p>
          {!canShowResults && (
            <p>We recommend at least {recommended} comparisons for better accuracy.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComparisonSection;
