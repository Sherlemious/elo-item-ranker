
export const parseCSV = (
  content: string, 
  delimiter: ',' | ';' | '\t' | 'auto' = 'auto'
): string[] => {
  // Auto-detect delimiter if not specified
  if (delimiter === 'auto') {
    // Count occurrences of each delimiter
    const commaCount = (content.match(/,/g) || []).length;
    const semicolonCount = (content.match(/;/g) || []).length;
    const tabCount = (content.match(/\t/g) || []).length;
    
    // Use the most frequent delimiter
    if (commaCount >= semicolonCount && commaCount >= tabCount) {
      delimiter = ',';
    } else if (semicolonCount >= commaCount && semicolonCount >= tabCount) {
      delimiter = ';';
    } else {
      delimiter = '\t';
    }
  }
  
  // Split content by newlines first
  const lines = content.split(/\r?\n/);
  const result: string[] = [];
  
  // Process each line
  for (const line of lines) {
    if (!line.trim()) continue;
    
    // Simple CSV parsing (doesn't handle quoted values with delimiters inside them)
    const values = line.split(delimiter);
    
    // Add each non-empty value to results
    for (const value of values) {
      const trimmed = value.trim();
      if (trimmed) {
        result.push(trimmed);
      }
    }
  }
  
  return result;
};

// Parse any text input (comma or line separated)
export const parseTextInput = (text: string): string[] => {
  // First split by newlines
  const lineItems = text.split(/\r?\n/).filter(line => line.trim());
  
  // Then check if there are commas - if so, split those lines by comma as well
  const result: string[] = [];
  
  for (const item of lineItems) {
    // If line contains commas, split by commas
    if (item.includes(',')) {
      const commaItems = item.split(',').map(i => i.trim()).filter(i => i);
      result.push(...commaItems);
    } else {
      result.push(item.trim());
    }
  }
  
  return result;
};
