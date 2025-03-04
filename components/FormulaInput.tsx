import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useFormulaStore } from '@/lib/formulaStore';
import { CheckIcon, ChevronDownIcon, PencilIcon, XIcon } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Variable = {
    id: string;
    name: string;
    category: string;
    value: number | string;
};

const OPERATORS = ['+', '-', '*', '/', '^', '(', ')'];

const FormulaInput: React.FC = () => {
    const {
        formula = [],
        addVariable,
        removeVariable,
        replaceVariable,
        calculateResult
    } = useFormulaStore();

    const [inputValue, setInputValue] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [result, setResult] = useState<number | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [selectedTagIndex, setSelectedTagIndex] = useState<number | null>(null);
    const [editingTagIndex, setEditingTagIndex] = useState<number | null>(null);
    const [editingValue, setEditingValue] = useState('');
    const editInputRef = useRef<HTMLInputElement>(null);

    // Fetch suggestions from API
    const { data: suggestions = [] } = useQuery<Variable[]>({
        queryKey: ['variableSuggestions', inputValue],
        queryFn: async () => {
            const response = await fetch('https://652f91320b8d8ddac0b2b62b.mockapi.io/autocomplete');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        },
        enabled: inputValue.length > 0 && !OPERATORS.includes(inputValue),
    });

    // Filter suggestions based on input
    const filteredSuggestions = suggestions.filter(item =>
        item.name.toLowerCase().includes(inputValue.toLowerCase())
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        if (e.target.value) {
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        // Handle backspace to delete tags
        if (e.key === 'Backspace' && inputValue === '' && formula.length > 0) {
            e.preventDefault();
            removeVariable(formula.length - 1);
        }

        // Handle operators directly
        if (OPERATORS.includes(e.key)) {
            e.preventDefault();
            if (inputValue) {
                // Try to parse as number first
                const numValue = parseFloat(inputValue);

                // Add current input as a variable if there's text
                addVariable({
                    id: Date.now().toString(),
                    name: inputValue,
                    category: isNaN(numValue) ? 'custom' : 'number',
                    value: isNaN(numValue) ? 0 : numValue
                });
                setInputValue('');
            }

            // Add the operator as a variable
            addVariable({
                id: Date.now().toString(),
                name: e.key,
                category: 'operator',
                value: e.key
            });
        }

        // Handle Enter to add current input as a variable
        if (e.key === 'Enter' && inputValue) {
            e.preventDefault();

            // If we have suggestions and input matches partially, use first suggestion
            if (filteredSuggestions.length > 0 && showSuggestions) {
                handleSelectSuggestion(filteredSuggestions[0]);
            } else {
                // Try to parse as number first
                const numValue = parseFloat(inputValue);

                addVariable({
                    id: Date.now().toString(),
                    name: inputValue,
                    category: isNaN(numValue) ? 'custom' : 'number',
                    value: isNaN(numValue) ? 0 : numValue
                });
            }

            setInputValue('');
            setShowSuggestions(false);
        }

        // Handle Tab to select suggestion
        if (e.key === 'Tab' && showSuggestions && filteredSuggestions.length > 0) {
            e.preventDefault();
            handleSelectSuggestion(filteredSuggestions[0]);
        }

        // Handle equal sign to calculate
        if (e.key === '=' || e.key === 'Enter' && inputValue === '') {
            e.preventDefault();
            evaluateFormula();
        }
    };

    const handleSelectSuggestion = (suggestion: Variable) => {
        addVariable(suggestion);
        setInputValue('');
        setShowSuggestions(false);
        inputRef.current?.focus();
    };

    const handleReplaceVariable = (index: number, variable: Variable) => {
        replaceVariable(index, variable);
        setSelectedTagIndex(null);
    };

    const handleTagClick = (index: number) => {
        // If we're already editing a different tag, finish that edit first
        if (editingTagIndex !== null && editingTagIndex !== index) {
            finishEditing();
        }

        setSelectedTagIndex(index === selectedTagIndex ? null : index);
    };

    const startEditing = (index: number) => {
        const variable = formula[index];
        if (variable.category !== 'operator') {
            setEditingTagIndex(index);
            setEditingValue(variable.name);
            // Set a small timeout to ensure the DOM element is available
            setTimeout(() => {
                editInputRef.current?.focus();
                editInputRef.current?.select();
            }, 10);
        }
    };

    const handleEditingKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            finishEditing();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            cancelEditing();
        }
    };

    const finishEditing = () => {
        if (editingTagIndex !== null) {
            const numValue = parseFloat(editingValue);
            replaceVariable(editingTagIndex, {
                ...formula[editingTagIndex],
                name: editingValue,
                category: isNaN(numValue) ? 'custom' : 'number',
                value: isNaN(numValue) ? 0 : numValue
            });
            setEditingTagIndex(null);
            setEditingValue('');
            inputRef.current?.focus();
        }
    };

    const cancelEditing = () => {
        setEditingTagIndex(null);
        setEditingValue('');
        inputRef.current?.focus();
    };

    const evaluateFormula = () => {
        // If there's text in the input, add it first
        if (inputValue) {
            const numValue = parseFloat(inputValue);
            addVariable({
                id: Date.now().toString(),
                name: inputValue,
                category: isNaN(numValue) ? 'custom' : 'number',
                value: isNaN(numValue) ? 0 : numValue
            });
            setInputValue('');
        }

        const result = calculateResult();
        setResult(result);
    };

    const handleRemoveVariable = (index: number, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering other click handlers
        removeVariable(index);
    };

    useEffect(() => {
        // Keep focus on input unless we're editing a tag
        if (editingTagIndex === null) {
            inputRef.current?.focus();
        }
    }, [formula, editingTagIndex]);

    // Click outside handler to finish editing
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (editingTagIndex !== null &&
                editInputRef.current &&
                !editInputRef.current.contains(e.target as Node)) {
                finishEditing();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [editingTagIndex, editingValue]);

    return (
        <div className="relative w-full">
            <div className="flex items-center border rounded-md p-2 bg-white min-h-10 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                <div className="flex flex-wrap gap-1 items-center flex-grow">
                    {Array.isArray(formula) && formula.map((item, index) => (
                        <div key={`${item.id}-${index}`} className="relative">
                            {item.category === 'operator' ? (
                                <span className="mx-1 text-gray-700">{item.name}</span>
                            ) : editingTagIndex === index ? (
                                <div className="flex items-center px-2 py-1 rounded bg-blue-100 border-2 border-blue-300">
                                    <input
                                        ref={editInputRef}
                                        type="text"
                                        className="outline-none bg-transparent w-full"
                                        value={editingValue}
                                        onChange={(e) => setEditingValue(e.target.value)}
                                        onKeyDown={(e) => handleEditingKeyDown(e, index)}
                                        onBlur={finishEditing}
                                    />
                                    <button
                                        className="ml-1 text-gray-500 hover:text-gray-700"
                                        onClick={finishEditing}
                                    >
                                        <CheckIcon className="h-3 w-3" />
                                    </button>
                                </div>
                            ) : (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <div
                                            className={`
                                                px-2 py-1 rounded text-sm flex items-center gap-1 cursor-pointer
                                                ${item.category === 'number' ? 'bg-gray-100' : 'bg-blue-100'}
                                                ${selectedTagIndex === index ? 'ring-2 ring-blue-300' : ''}
                                                group
                                            `}
                                            onClick={() => handleTagClick(index)}
                                        >
                                            {item.name}
                                            <div className="flex items-center">
                                                <button
                                                    className="hidden group-hover:block mr-1 text-gray-500 hover:text-gray-700"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        startEditing(index);
                                                    }}
                                                >
                                                    <PencilIcon className="h-3 w-3" />
                                                </button>
                                                <button
                                                    className="hidden group-hover:block mr-1 text-gray-500 hover:text-red-500"
                                                    onClick={(e) => handleRemoveVariable(index, e)}
                                                >
                                                    <XIcon className="h-3 w-3" />
                                                </button>
                                                <ChevronDownIcon className="h-3 w-3" />
                                            </div>
                                        </div>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                startEditing(index);
                                            }}
                                        >
                                            <div className="flex items-center text-sm">
                                                <PencilIcon className="h-3 w-3 mr-2" />
                                                Edit
                                            </div>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={(e) => handleRemoveVariable(index, e)}
                                        >
                                            <div className="flex items-center text-sm text-red-500">
                                                <XIcon className="h-3 w-3 mr-2" />
                                                Remove
                                            </div>
                                        </DropdownMenuItem>
                                        <hr className="my-1" />
                                        <DropdownMenuItem className="text-xs text-gray-500 py-1 pointer-events-none">
                                            Replace with:
                                        </DropdownMenuItem>
                                        {suggestions.slice(0, 5).map((suggestion, suggestionIndex) => (
                                            <DropdownMenuItem
                                                key={`${suggestion.id}-${suggestionIndex}`}
                                                onClick={() => handleReplaceVariable(index, suggestion)}
                                            >
                                                <div className="flex items-center justify-between w-full">
                                                    <span>{suggestion.name}</span>
                                                    <span className="text-xs text-gray-500">{suggestion.category}</span>
                                                </div>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    ))}

                    <input
                        ref={inputRef}
                        type="text"
                        className="outline-none flex-grow min-w-[50px]"
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder={formula.length === 0 ? "Enter formula" : ""}
                    />
                </div>

                <button
                    onClick={evaluateFormula}
                    className="ml-2 p-1 rounded bg-blue-500 text-white text-xs"
                >
                    =
                </button>
            </div>

            {result !== null && (
                <div className="absolute right-2 -bottom-6 text-sm font-medium">
                    = {result}
                </div>
            )}

            {/* Autocomplete suggestions */}
            {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
                    <ul className="py-1 max-h-60 overflow-auto">
                        {filteredSuggestions.slice(0, 7).map((suggestion, suggestionIndex) => (
                            <li
                                key={`${suggestion.id}-${suggestionIndex}`}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between"
                                onClick={() => handleSelectSuggestion(suggestion)}
                            >
                                <span>{suggestion.name}</span>
                                <span className="text-xs text-gray-500">{suggestion.category}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default FormulaInput;