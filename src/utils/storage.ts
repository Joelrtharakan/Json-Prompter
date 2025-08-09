export interface StorageManager {
  save<T>(key: string, data: T): Promise<void>
  load<T>(key: string): Promise<T | null>
  remove(key: string): Promise<void>
  list(): Promise<string[]>
}

class LocalStorageManager implements StorageManager {
  private prefix = 'json-prompter-'

  async save<T>(key: string, data: T): Promise<void> {
    try {
      const serialized = JSON.stringify({
        data,
        timestamp: Date.now(),
        version: '1.0.0'
      })
      localStorage.setItem(this.prefix + key, serialized)
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
      throw new Error('Storage save failed')
    }
  }

  async load<T>(key: string): Promise<T | null> {
    try {
      const item = localStorage.getItem(this.prefix + key)
      if (!item) return null
      
      const parsed = JSON.parse(item)
      return parsed.data as T
    } catch (error) {
      console.error('Failed to load from localStorage:', error)
      return null
    }
  }

  async remove(key: string): Promise<void> {
    localStorage.removeItem(this.prefix + key)
  }

  async list(): Promise<string[]> {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(this.prefix)) {
        keys.push(key.replace(this.prefix, ''))
      }
    }
    return keys
  }
}

// Auto-save functionality
export class AutoSaveManager {
  private saveTimeout: number | null = null
  private storage: StorageManager
  private delay: number

  constructor(storage: StorageManager, delay = 2000) {
    this.storage = storage
    this.delay = delay
  }

  scheduleAutoSave<T>(key: string, data: T): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout)
    }

    this.saveTimeout = setTimeout(async () => {
      try {
        await this.storage.save(key, data)
        console.log(`Auto-saved: ${key}`)
      } catch (error) {
        console.error('Auto-save failed:', error)
      }
    }, this.delay) as any
  }

  cancelAutoSave(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout)
      this.saveTimeout = null
    }
  }
}

export const storageManager = new LocalStorageManager()
export const autoSaveManager = new AutoSaveManager(storageManager)
