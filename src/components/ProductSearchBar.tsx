import React, { useState } from 'react';
import {
  Autocomplete,
  TextField,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface ProductSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  suggestions?: string[];
  loading?: boolean;
  placeholder?: string;
  label?: string;
  loadingLabel?: string;
  onSubmit?: () => void;
  /** Hide autocomplete dropdown while results are shown below */
  disableSuggestions?: boolean;
}

export const ProductSearchBar: React.FC<ProductSearchBarProps> = ({
  value,
  onChange,
  suggestions = [],
  loading = false,
  placeholder = '',
  label,
  loadingLabel = 'Loading',
  onSubmit,
  disableSuggestions = false,
}) => {
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);

  return (
    <Autocomplete
      freeSolo
      fullWidth
      open={!disableSuggestions && suggestionsOpen}
      onOpen={() => setSuggestionsOpen(true)}
      onClose={() => setSuggestionsOpen(false)}
      options={disableSuggestions ? [] : suggestions}
      inputValue={value}
      onInputChange={(_e, newValue) => onChange(newValue)}
      onChange={(_e, selected) => {
        if (typeof selected === 'string') onChange(selected);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          inputProps={{
            ...params.inputProps,
            'aria-label': label || placeholder,
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && onSubmit) onSubmit();
          }}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
                {params.InputProps.startAdornment}
              </>
            ),
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={18} aria-label={loadingLabel} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};
