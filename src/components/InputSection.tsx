
import React, { useState, useRef } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { parseCSV, parseTextInput } from '@/utils/fileParser';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { X, Plus, Upload, Trash2 } from 'lucide-react';

const InputSection: React.FC = () => {
  const { addItem, addItems, removeItem, clearAllItems, state, startComparison } = useAppContext();
  const { toast } = useToast();
  
  const [singleItem, setSingleItem] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [delimiter, setDelimiter] = useState<'auto' | ',' | ';' | '\t'>('auto');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleAddSingleItem = () => {
    if (singleItem.trim()) {
      addItem(singleItem);
      setSingleItem('');
    }
  };
  
  const handleAddBulkItems = () => {
    if (bulkText.trim()) {
      const items = parseTextInput(bulkText);
      if (items.length > 0) {
        const duplicates = addItems(items);
        
        if (duplicates.length > 0) {
          toast({
            title: 'Duplicates skipped',
            description: `${duplicates.length} duplicate items were skipped.`,
          });
        }
        
        setBulkText('');
      }
    }
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const items = parseCSV(content, delimiter);
        if (items.length > 0) {
          const duplicates = addItems(items);
          
          toast({
            title: 'Items imported',
            description: `${items.length - duplicates.length} items imported, ${duplicates.length} duplicates skipped.`,
          });
        }
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddSingleItem();
    }
  };
  
  const canStartComparison = state.items.length >= 3;
  
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-center">ELO Rating System</h1>
        <p className="text-center text-muted-foreground">
          Rank your items through pairwise comparisons using an ELO rating system
        </p>
        
        {state.items.length > 0 && (
          <div className="flex justify-center mt-4">
            <Button 
              onClick={startComparison} 
              disabled={!canStartComparison}
              size="lg"
              className="gap-2"
            >
              {canStartComparison ? 'Start Ranking' : `Add at least ${3 - state.items.length} more item${3 - state.items.length > 1 ? 's' : ''}`}
            </Button>
          </div>
        )}
      </div>
      
      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="single">Add Single Item</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Text Input</TabsTrigger>
          <TabsTrigger value="file">Upload File</TabsTrigger>
        </TabsList>
        
        <TabsContent value="single" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Item</CardTitle>
              <CardDescription>
                Add items one at a time. Press Enter or click Add to add an item.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input 
                  value={singleItem}
                  onChange={(e) => setSingleItem(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter an item to rank..."
                  className="flex-1"
                />
                <Button onClick={handleAddSingleItem} disabled={!singleItem.trim()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bulk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Add Items</CardTitle>
              <CardDescription>
                Enter multiple items separated by commas or new lines.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea 
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="Item 1, Item 2, Item 3&#10;Item 4&#10;Item 5, Item 6"
                className="min-h-[150px]"
              />
              <Button onClick={handleAddBulkItems} disabled={!bulkText.trim()} className="w-full">
                Add Items
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="file" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload CSV File</CardTitle>
              <CardDescription>
                Upload a CSV file containing your items.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Delimiter:</label>
                  <Select 
                    value={delimiter} 
                    onValueChange={(value) => setDelimiter(value as any)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Select delimiter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto-detect</SelectItem>
                      <SelectItem value=",">Comma (,)</SelectItem>
                      <SelectItem value=";">Semicolon (;)</SelectItem>
                      <SelectItem value="\t">Tab</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                  <input 
                    type="file" 
                    accept=".csv,.txt" 
                    onChange={handleFileUpload}
                    ref={fileInputRef}
                    className="hidden"
                    id="csvUpload"
                  />
                  <label htmlFor="csvUpload" className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="font-medium">Click to upload a CSV file</span>
                    <span className="text-sm text-muted-foreground">
                      or drag and drop file here
                    </span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Items ({state.items.length})</h2>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={clearAllItems}
              disabled={state.items.length === 0}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-0">
            {state.items.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                No items added yet. Add some items to get started.
              </div>
            ) : (
              <ul className="divide-y">
                {state.items.map((item) => (
                  <li 
                    key={item.id}
                    className="flex items-center justify-between p-3 hover:bg-muted/50"
                  >
                    <span className="truncate">{item.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove {item.name}</span>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InputSection;
