import { create } from "zustand"
import { persist } from "zustand/middleware"

type Variable = {
    id: string
    name: string
    category: string
    value: number | string
}

type FormulaState = {
    formula: Variable[]
    addVariable: (variable: Variable) => void
    removeVariable: (index: number) => void
    replaceVariable: (index: number, variable: Variable) => void
    setFormula: (formula: Variable[]) => void
    calculateResult: () => number
}

export const useFormulaStore = create<FormulaState>()(
    persist(
        (set, get) => ({
            formula: [],

            addVariable: (variable) => {
                set((state) => ({
                    formula: [...state.formula, variable],
                }))
            },

            removeVariable: (index) => {
                set((state) => ({
                    formula: state.formula.filter((_, i) => i !== index),
                }))
            },

            replaceVariable: (index, variable) => {
                set((state) => {
                    const newFormula = [...state.formula]
                    newFormula[index] = variable
                    return { formula: newFormula }
                })
            },

            setFormula: (formula) => {
                set({ formula })
            },

            calculateResult: () => {
                const { formula } = get()

                if (formula.length === 0) return 0

                // Create a string expression to evaluate
                let expressionString = ""

                formula.forEach((item) => {
                    if (item.category === "operator") {
                        expressionString += item.name
                    } else {
                        // Get the numeric value or use 0
                        const numValue = typeof item.value === "number" ? item.value : Number.parseFloat(item.value.toString()) || 0
                        expressionString += numValue
                    }
                })

                try {
                    // Using Function constructor to evaluate the expression
                    // Note: This is not secure for production without proper validation
                    return Function(`"use strict"; return (${expressionString})`)()
                } catch (error) {
                    console.error("Error calculating formula:", error)
                    return 0
                }
            },
        }),
        {
            name: "formula-storage", // unique name for localStorage key
            partialize: (state) => ({ formula: state.formula }), // only persist the formula array
        },
    ),
)