import { createContext, useContext, useReducer } from 'react'
import type { ReactNode } from 'react'
import { generateJsonSchemaFromFields, validateJsonWithSchema } from '../utils/validation'

// Types for our JSON Prompt Generator
export interface JsonField {
  id: string
  name: string
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'integer'
  required: boolean
  description?: string
  default?: any
  enum?: string[]
  properties?: JsonField[]
  
  // String validations
  pattern?: string
  minLength?: number
  maxLength?: number
  format?: string
  
  // Number validations
  minimum?: number
  maximum?: number
  multipleOf?: number
  
  // Array validations
  minItems?: number
  maxItems?: number
  uniqueItems?: boolean
  items?: { type: JsonField['type'] }
  
  // Common
  examples?: string[]
  title?: string
}

export interface PromptTemplate {
  id: string
  name: string
  description: string
  fields: JsonField[]
  schema: object
  createdAt: Date
  updatedAt: Date
}

export interface Architecture {
  id: string
  name: string
  description: string
  templates: PromptTemplate[]
  settings: {
    validateOnType: boolean
    autoSave: boolean
    theme: 'light' | 'dark'
  }
}

interface ArchitectureState {
  currentArchitecture: Architecture | null
  architectures: Architecture[]
  isLoading: boolean
  error: string | null
}

type ArchitectureAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CURRENT_ARCHITECTURE'; payload: Architecture }
  | { type: 'ADD_ARCHITECTURE'; payload: Architecture }
  | { type: 'UPDATE_ARCHITECTURE'; payload: Architecture }
  | { type: 'DELETE_ARCHITECTURE'; payload: string }
  | { type: 'ADD_TEMPLATE'; payload: { architectureId: string; template: PromptTemplate } }
  | { type: 'UPDATE_TEMPLATE'; payload: { architectureId: string; template: PromptTemplate } }
  | { type: 'DELETE_TEMPLATE'; payload: { architectureId: string; templateId: string } }

const initialState: ArchitectureState = {
  currentArchitecture: null,
  architectures: [],
  isLoading: false,
  error: null
}

function architectureReducer(state: ArchitectureState, action: ArchitectureAction): ArchitectureState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    case 'SET_CURRENT_ARCHITECTURE':
      return { ...state, currentArchitecture: action.payload }
    case 'ADD_ARCHITECTURE':
      return {
        ...state,
        architectures: [...state.architectures, action.payload],
        currentArchitecture: action.payload
      }
    case 'UPDATE_ARCHITECTURE':
      return {
        ...state,
        architectures: state.architectures.map(arch =>
          arch.id === action.payload.id ? action.payload : arch
        ),
        currentArchitecture:
          state.currentArchitecture?.id === action.payload.id
            ? action.payload
            : state.currentArchitecture
      }
    case 'DELETE_ARCHITECTURE':
      return {
        ...state,
        architectures: state.architectures.filter(arch => arch.id !== action.payload),
        currentArchitecture:
          state.currentArchitecture?.id === action.payload ? null : state.currentArchitecture
      }
    case 'ADD_TEMPLATE':
      return {
        ...state,
        architectures: state.architectures.map(arch =>
          arch.id === action.payload.architectureId
            ? { ...arch, templates: [...arch.templates, action.payload.template] }
            : arch
        ),
        currentArchitecture:
          state.currentArchitecture?.id === action.payload.architectureId
            ? {
                ...state.currentArchitecture,
                templates: [...state.currentArchitecture.templates, action.payload.template]
              }
            : state.currentArchitecture
      }
    case 'UPDATE_TEMPLATE':
      return {
        ...state,
        architectures: state.architectures.map(arch =>
          arch.id === action.payload.architectureId
            ? {
                ...arch,
                templates: arch.templates.map(template =>
                  template.id === action.payload.template.id ? action.payload.template : template
                )
              }
            : arch
        ),
        currentArchitecture:
          state.currentArchitecture?.id === action.payload.architectureId
            ? {
                ...state.currentArchitecture,
                templates: state.currentArchitecture.templates.map(template =>
                  template.id === action.payload.template.id ? action.payload.template : template
                )
              }
            : state.currentArchitecture
      }
    case 'DELETE_TEMPLATE':
      return {
        ...state,
        architectures: state.architectures.map(arch =>
          arch.id === action.payload.architectureId
            ? {
                ...arch,
                templates: arch.templates.filter(template => template.id !== action.payload.templateId)
              }
            : arch
        ),
        currentArchitecture:
          state.currentArchitecture?.id === action.payload.architectureId
            ? {
                ...state.currentArchitecture,
                templates: state.currentArchitecture.templates.filter(
                  template => template.id !== action.payload.templateId
                )
              }
            : state.currentArchitecture
      }
    default:
      return state
  }
}

interface ArchitectureContextType {
  state: ArchitectureState
  dispatch: React.Dispatch<ArchitectureAction>
  // Helper functions
  createArchitecture: (name: string, description: string) => void
  createTemplate: (architectureId: string, name: string, description: string) => void
  generateJsonSchema: (fields: JsonField[]) => object
  validateJson: (json: string, schema: object) => { valid: boolean; errors: string[] }
}

const ArchitectureContext = createContext<ArchitectureContextType | undefined>(undefined)

export function ArchitectureProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(architectureReducer, initialState)

  const createArchitecture = (name: string, description: string) => {
    const newArchitecture: Architecture = {
      id: `arch-${Date.now()}`,
      name,
      description,
      templates: [],
      settings: {
        validateOnType: true,
        autoSave: true,
        theme: 'light'
      }
    }
    dispatch({ type: 'ADD_ARCHITECTURE', payload: newArchitecture })
  }

  const createTemplate = (architectureId: string, name: string, description: string) => {
    const newTemplate: PromptTemplate = {
      id: `template-${Date.now()}`,
      name,
      description,
      fields: [],
      schema: {},
      createdAt: new Date(),
      updatedAt: new Date()
    }
    dispatch({ type: 'ADD_TEMPLATE', payload: { architectureId, template: newTemplate } })
  }

  const generateJsonSchema = (fields: JsonField[]): object => {
    return generateJsonSchemaFromFields(fields)
  }

  const validateJson = (json: string, schema: object): { valid: boolean; errors: string[] } => {
    const result = validateJsonWithSchema(json, schema)
    return {
      valid: result.valid,
      errors: result.errors.map(err => err.message)
    }
  }

  const value: ArchitectureContextType = {
    state,
    dispatch,
    createArchitecture,
    createTemplate,
    generateJsonSchema,
    validateJson
  }

  return (
    <ArchitectureContext.Provider value={value}>
      {children}
    </ArchitectureContext.Provider>
  )
}

export function useArchitecture() {
  const context = useContext(ArchitectureContext)
  if (context === undefined) {
    throw new Error('useArchitecture must be used within an ArchitectureProvider')
  }
  return context
}
