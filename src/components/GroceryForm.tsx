import React, { useState } from 'react';
import { TextField, Button, FormControl, InputLabel, Select, MenuItem, Box, Stack } from '@mui/material';
import { Grocery } from '../types';

interface GroceryFormProps {
  onAddGrocery: (grocery: Grocery) => void;
}

const GroceryForm: React.FC<GroceryFormProps> = ({ onAddGrocery }) => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState<'piece' | 'kg' | 'gram' | 'liter' | 'ml'>('piece');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (name.trim() === '') return;
    
    const newGrocery: Grocery = {
      id: `${Date.now()}`,
      name: name.trim(),
      quantity,
      unit,
    };
    
    onAddGrocery(newGrocery);
    
    // Reset form
    setName('');
    setQuantity(1);
    setUnit('piece');
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
        <TextField
          fullWidth
          label="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g. Milk, Bread, Apples"
          sx={{ flex: 5 }}
        />
        
        <TextField
          fullWidth
          label="Quantity"
          type="number"
          InputProps={{ inputProps: { min: 0.1, step: 0.1 } }}
          value={quantity}
          onChange={(e) => setQuantity(parseFloat(e.target.value))}
          required
          sx={{ flex: 2 }}
        />
        
        <FormControl fullWidth sx={{ flex: 3 }}>
          <InputLabel>Unit</InputLabel>
          <Select
            value={unit}
            label="Unit"
            onChange={(e) => setUnit(e.target.value as 'piece' | 'kg' | 'gram' | 'liter' | 'ml')}
          >
            <MenuItem value="piece">Piece</MenuItem>
            <MenuItem value="kg">Kilogram</MenuItem>
            <MenuItem value="gram">Gram</MenuItem>
            <MenuItem value="liter">Liter</MenuItem>
            <MenuItem value="ml">Milliliter</MenuItem>
          </Select>
        </FormControl>
        
        <Button 
          type="submit" 
          variant="contained" 
          color="primary" 
          fullWidth
          sx={{ height: '56px', flex: 2 }}
        >
          Add Item
        </Button>
      </Stack>
    </Box>
  );
};

export default GroceryForm; 