import { useState, useEffect, useRef, useCallback } from 'react'
import { storageManager, autoSaveManager } from '../utils/storage'

// Hook for managing undo/redo functionality
export function useUndoRedo<T>(initialState: T, maxHistorySize = 50) {
  const [history, setHistory] = useState<T[]>([initialState])
  const [currentIndex, setCurrentIndex] = useState(0)

  const addToHistory = useCallback((newState: T) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, currentIndex + 1)
      newHistory.push(newState)
      
      if (newHistory.length > maxHistorySize) {
        newHistory.shift()
        return newHistory
      }
      
      return newHistory
    })
    setCurrentIndex(prev => Math.min(prev + 1, maxHistorySize - 1))
  }, [currentIndex, maxHistorySize])

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }, [currentIndex])

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prev => prev + 1)
    }
  }, [currentIndex, history.length])

  const canUndo = currentIndex > 0
  const canRedo = currentIndex < history.length - 1
  const currentState = history[currentIndex]

  return {
    currentState,
    addToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    historySize: history.length
  }
}

// Hook for debounced values
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Hook for keyboard shortcuts
export function useKeyboardShortcuts(shortcuts: Record<string, () => void>) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = [
        event.ctrlKey && 'ctrl',
        event.metaKey && 'meta',
        event.shiftKey && 'shift',
        event.altKey && 'alt',
        event.key.toLowerCase()
      ].filter(Boolean).join('+')

      const handler = shortcuts[key]
      if (handler) {
        event.preventDefault()
        handler()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}

// Hook for auto-save functionality
export function useAutoSave<T>(
  data: T,
  key: string,
  enabled = true,
  delay = 2000
) {
  const debouncedData = useDebounce(data, delay)
  const isFirstRender = useRef(true)

  useEffect(() => {
    // Skip auto-save on initial render
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    if (enabled && debouncedData) {
      autoSaveManager.scheduleAutoSave(key, debouncedData)
    }

    return () => {
      autoSaveManager.cancelAutoSave()
    }
  }, [debouncedData, key, enabled])
}

// Hook for loading saved data
export function useSavedData<T>(key: string, defaultValue: T) {
  const [data, setData] = useState<T>(defaultValue)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const savedData = await storageManager.load<T>(key)
        if (savedData !== null) {
          setData(savedData)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [key])

  const saveData = useCallback(async (newData: T) => {
    try {
      await storageManager.save(key, newData)
      setData(newData)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save data')
    }
  }, [key])

  return { data, setData: saveData, loading, error }
}

// Hook for managing modal state
export function useModal() {
  const [isOpen, setIsOpen] = useState(false)
  
  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen(prev => !prev), [])

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        close()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, close])

  return { isOpen, open, close, toggle }
}

// Hook for managing focus trap in modals
export function useFocusTrap(ref: React.RefObject<HTMLElement>, active: boolean) {
  useEffect(() => {
    if (!active || !ref.current) return

    const element = ref.current
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement?.focus()
        }
      }
    }

    element.addEventListener('keydown', handleTabKey)
    firstElement?.focus()

    return () => {
      element.removeEventListener('keydown', handleTabKey)
    }
  }, [ref, active])
}
