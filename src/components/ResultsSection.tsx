
import React, { useState, useCallback } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowLeft, Download, ArrowUp, ArrowDown } from 'lucide-react';
import { calculateReliabilityScore, calculateTier } from '@/utils/eloCalculator';

const ResultsSection: React.FC = () => {
  const { state, resetToInput } = useAppContext();
  const { items, comparisons } = state;
  
  // Sort items by rating (highest first)
  const sortedItems = [...items].sort((a, b) => b.rating - a.rating);
  
  // Calculate reliability score
  const reliabilityScore = calculateReliabilityScore(items.length, comparisons.length);
  const reliabilityPercentage = Math.round(reliabilityScore * 100);
  
  // Get all ratings for tier calculation
  const allRatings = items.map(item => item.rating);
  
  // Group items by tier
  const tierGroups = {
    S: sortedItems.filter(item => calculateTier(item.rating, allRatings) === 'S'),
    A: sortedItems.filter(item => calculateTier(item.rating, allRatings) === 'A'),
    B: sortedItems.filter(item => calculateTier(item.rating, allRatings) === 'B'),
    C: sortedItems.filter(item => calculateTier(item.rating, allRatings) === 'C'),
    D: sortedItems.filter(item => calculateTier(item.rating, allRatings) === 'D'),
    F: sortedItems.filter(item => calculateTier(item.rating, allRatings) === 'F'),
  };
  
  // Calculate tier colors
  const tierColors = {
    S: 'bg-purple-500',
    A: 'bg-blue-500',
    B: 'bg-teal-500',
    C: 'bg-green-500',
    D: 'bg-amber-500',
    F: 'bg-rose-500',
  };
  
  // Export to CSV
  const exportToCSV = useCallback(() => {
    // Create CSV content
    let csvContent = 'Rank,Name,Rating,Tier,Wins,Losses,Total Comparisons\n';
    
    sortedItems.forEach((item, index) => {
      const tier = calculateTier(item.rating, allRatings);
      csvContent += `${index + 1},"${item.name.replace(/"/g, '""')}",${Math.round(item.rating)},${tier},${item.wins},${item.losses},${item.comparisons}\n`;
    });
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'elo_rankings.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [sortedItems, allRatings]);
  
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={resetToInput}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Items
        </Button>
        
        <Button
          onClick={exportToCSV}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export to CSV
        </Button>
      </div>
      
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-center">Ranking Results</h1>
        <div className="text-center">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-1 bg-muted rounded-full">
            <span className="text-sm font-medium">Reliability Score:</span>
            <span className={`text-sm font-semibold ${
              reliabilityPercentage >= 70 ? 'text-green-500' :
              reliabilityPercentage >= 40 ? 'text-amber-500' : 'text-rose-500'
            }`}>
              {reliabilityPercentage}%
            </span>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="tier">Tier View</TabsTrigger>
          <TabsTrigger value="raw">Raw Data</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader className="border-b p-4">
              <div className="grid grid-cols-12 text-sm font-semibold">
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-6">Name</div>
                <div className="col-span-2 text-right">Rating</div>
                <div className="col-span-1 text-center">Tier</div>
                <div className="col-span-2 text-center">W-L</div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y">
                {sortedItems.map((item, index) => {
                  const tier = calculateTier(item.rating, allRatings);
                  
                  return (
                    <li key={item.id} className="hover:bg-muted/50">
                      <div className="grid grid-cols-12 items-center p-3">
                        <div className="col-span-1 text-center font-semibold text-muted-foreground">
                          {index + 1}
                        </div>
                        <div className="col-span-6 truncate">{item.name}</div>
                        <div className="col-span-2 text-right font-mono">
                          {Math.round(item.rating)}
                        </div>
                        <div className="col-span-1 text-center">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white ${tierColors[tier]}`}>
                            {tier}
                          </span>
                        </div>
                        <div className="col-span-2 text-center text-sm">
                          <span className="text-green-500">{item.wins}</span>
                          -
                          <span className="text-rose-500">{item.losses}</span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tier" className="space-y-6">
          {['S', 'A', 'B', 'C', 'D', 'F'].map(tier => (
            <div key={tier} className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold ${tierColors[tier]}`}>
                  {tier}
                </div>
                <h3 className="text-lg font-semibold">Tier {tier}</h3>
                <div className="text-sm text-muted-foreground">
                  ({tierGroups[tier].length} items)
                </div>
              </div>
              
              {tierGroups[tier].length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {tierGroups[tier].map(item => (
                    <Card key={item.id} className="overflow-hidden">
                      <div className={`h-1 ${tierColors[tier]}`} />
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div className="font-medium truncate">{item.name}</div>
                          <div className="text-sm font-mono">{Math.round(item.rating)}</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 bg-muted/50 rounded-lg">
                  <p className="text-muted-foreground">No items in this tier</p>
                </div>
              )}
            </div>
          ))}
        </TabsContent>
        
        <TabsContent value="raw" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Items</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[500px] overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50 sticky top-0">
                      <tr>
                        <th className="text-left p-3 text-sm">Name</th>
                        <th className="text-right p-3 text-sm">Rating</th>
                        <th className="text-right p-3 text-sm">W-L</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {items.map(item => (
                        <tr key={item.id} className="hover:bg-muted/30">
                          <td className="p-3">{item.name}</td>
                          <td className="p-3 text-right font-mono">{Math.round(item.rating)}</td>
                          <td className="p-3 text-right">
                            <span className="text-green-500">{item.wins}</span>-
                            <span className="text-rose-500">{item.losses}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Comparisons</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[500px] overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50 sticky top-0">
                      <tr>
                        <th className="text-left p-3 text-sm">Winner</th>
                        <th className="text-left p-3 text-sm">Loser</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {comparisons.map(comparison => {
                        const winner = items.find(i => i.id === comparison.winnerId);
                        const loser = items.find(i => {
                          return i.id === (
                            comparison.item1Id === comparison.winnerId 
                              ? comparison.item2Id 
                              : comparison.item1Id
                          );
                        });
                        
                        if (!winner || !loser) return null;
                        
                        return (
                          <tr key={comparison.id} className="hover:bg-muted/30">
                            <td className="p-3">
                              <div className="flex items-center gap-1">
                                <ArrowUp className="h-3 w-3 text-green-500" />
                                {winner.name}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1">
                                <ArrowDown className="h-3 w-3 text-rose-500" />
                                {loser.name}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <dt className="text-sm text-muted-foreground">Total Items</dt>
                  <dd className="text-2xl font-semibold">{items.length}</dd>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <dt className="text-sm text-muted-foreground">Comparisons</dt>
                  <dd className="text-2xl font-semibold">{comparisons.length}</dd>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <dt className="text-sm text-muted-foreground">Possible Pairs</dt>
                  <dd className="text-2xl font-semibold">{items.length * (items.length - 1) / 2}</dd>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <dt className="text-sm text-muted-foreground">Reliability</dt>
                  <dd className="text-2xl font-semibold">{reliabilityPercentage}%</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResultsSection;
