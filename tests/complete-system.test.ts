import { describe, it, expect, beforeEach } from 'vitest'
import { JsonPromptGenerator } from '../src/core/promptGenerator'
import { PromptGeneratorAPI } from '../src/api/promptAPI'
import { TemplateEngine } from '../src/template/engine'
import { SchemaRegistryManager } from '../src/registry/schemaRegistry'
import { DomainRegistry } from '../src/domains/adapters'

describe('JSON Prompt Generator (DynamicArchitecture)', () => {
  let generator: JsonPromptGenerator
  let api: PromptGeneratorAPI
  let templateEngine: TemplateEngine
  let registry: SchemaRegistryManager

  beforeEach(() => {
    generator = new JsonPromptGenerator()
    api = new PromptGeneratorAPI()
    templateEngine = new TemplateEngine()
    registry = new SchemaRegistryManager()
  })

  describe('Core Prompt Generator', () => {
    it('should generate valid chat prompts', async () => {
      const input = {
        domain: 'chat',
        task_description: 'Create a helpful coding assistant',
        constraints: ['Be concise', 'Use examples'],
        style: 'professional'
      }

      const result = await generator.generatePrompt(input)
      
      expect(result.domain).toBe('chat')
      expect(result.validation.valid).toBe(true)
      expect(result.prompt).toHaveProperty('role')
      expect(result.prompt).toHaveProperty('goals')
      expect(result.meta.generator).toBe('JsonPromptGenerator')
    })

    it('should generate valid image prompts', async () => {
      const input = {
        domain: 'image',
        task_description: 'Create a landscape scene',
        variables: {
          subject: 'Mountain landscape',
          mood: { emotionalTone: 'peaceful' }
        }
      }

      const result = await generator.generatePrompt(input)
      
      expect(result.domain).toBe('image')
      expect(result.validation.valid).toBe(true)
      expect(result.prompt).toHaveProperty('subject')
      expect((result.prompt as any).subject).toBe('Mountain landscape')
    })

    it('should handle unknown domains', async () => {
      const input = {
        domain: 'unknown',
        task_description: 'Test unknown domain'
      }

      await expect(generator.generatePrompt(input)).rejects.toThrow('Unknown domain: unknown')
    })

    it('should validate prompts correctly', () => {
      const prompt = {
        role: 'Assistant',
        goals: ['Help users']
      }

      const schema = {
        type: 'object',
        properties: {
          role: { type: 'string' },
          goals: { type: 'array', items: { type: 'string' } }
        },
        required: ['role', 'goals']
      }

      const result = generator.validatePrompt(prompt, schema)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('Template Engine', () => {
    it('should render simple variables', () => {
      const template = 'Hello {{name}}, welcome to {{app}}'
      const context = {
        variables: { name: 'John', app: 'JSON Generator' },
        defaults: {},
        conditionals: {}
      }

      const result = templateEngine.compile(template, context)
      expect(result).toBe('Hello John, welcome to JSON Generator')
    })

    it('should handle conditionals', () => {
      const template = '{{#if showGreeting}}Hello {{name}}{{/if}}'
      const context = {
        variables: { name: 'John' },
        defaults: {},
        conditionals: { showGreeting: true }
      }

      const result = templateEngine.compile(template, context)
      expect(result).toBe('Hello John')
    })

    it('should render JSON templates', () => {
      const template = '{"role": "{{role}}", "goals": {{json goals}}}'
      const context = {
        variables: { role: 'Assistant', goals: ['Help', 'Learn'] },
        defaults: {},
        conditionals: {}
      }

      const result = templateEngine.renderJsonTemplate(template, context)
      expect(result).toEqual({
        role: 'Assistant',
        goals: ['Help', 'Learn']
      })
    })

    it('should extract variables from templates', () => {
      const template = 'Hello {{name}}, your {{role}} is {{status}}'
      const variables = templateEngine.extractVariables(template)
      
      expect(variables).toContain('name')
      expect(variables).toContain('role')
      expect(variables).toContain('status')
    })

    it('should validate template syntax', () => {
      const validTemplate = '{"key": "{{value}}"}'
      const invalidTemplate = '{"key": "{{value}"' // Missing closing brace

      const validResult = templateEngine.validateTemplate(validTemplate)
      const invalidResult = templateEngine.validateTemplate(invalidTemplate)

      expect(validResult.valid).toBe(true)
      expect(invalidResult.valid).toBe(false)
    })
  })

  describe('Schema Registry', () => {
    it('should register and retrieve schemas', () => {
      const schema = {
        type: 'object',
        properties: { name: { type: 'string' } }
      }

      registry.registerSchema('test', 'v1', schema, '{"name": "{{name}}"}')
      
      const retrievedSchema = registry.getSchema('test', 'v1')
      expect(retrievedSchema).toEqual(schema)
    })

    it('should handle version management', () => {
      const schema1 = { type: 'object', properties: { v1: { type: 'string' } } }
      const schema2 = { type: 'object', properties: { v2: { type: 'string' } } }

      registry.registerSchema('test', 'v1', schema1, 'template1')
      registry.registerSchema('test', 'v2', schema2, 'template2')

      const versions = registry.getVersions('test')
      expect(versions).toContain('v1')
      expect(versions).toContain('v2')
    })

    it('should validate user schemas safely', () => {
      const validSchema = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: { name: { type: 'string' } }
      }

      const invalidSchema = {
        type: 'object',
        $ref: 'dangerous-reference'
      }

      const validResult = registry.validateUserSchema(validSchema)
      const invalidResult = registry.validateUserSchema(invalidSchema)

      expect(validResult.valid).toBe(true)
      expect(invalidResult.valid).toBe(false)
      expect(invalidResult.errors).toContain(expect.stringContaining('complex references'))
    })

    it('should export and import registry data', () => {
      registry.registerSchema('test', 'v1', { type: 'object' }, 'template')
      
      const exported = registry.exportRegistry()
      const newRegistry = new SchemaRegistryManager()
      newRegistry.importRegistry(exported)

      const retrievedSchema = newRegistry.getSchema('test', 'v1')
      expect(retrievedSchema).toEqual({ type: 'object' })
    })
  })

  describe('Domain Registry', () => {
    it('should provide all default domains', () => {
      const domainRegistry = new DomainRegistry()
      const domains = domainRegistry.getAvailableDomains()

      expect(domains).toContain('chat')
      expect(domains).toContain('image')
      expect(domains).toContain('music')
      expect(domains).toContain('video')
    })

    it('should retrieve domain adapters', () => {
      const domainRegistry = new DomainRegistry()
      const chatAdapter = domainRegistry.getAdapter('chat')

      expect(chatAdapter).toBeDefined()
      expect(chatAdapter?.domain).toBe('chat')
      expect(chatAdapter?.requiredFields).toContain('role')
      expect(chatAdapter?.requiredFields).toContain('goals')
    })
  })

  describe('API Layer', () => {
    it('should handle generate prompt requests', async () => {
      const request = {
        domain: 'chat',
        task_description: 'Test task',
        constraints: ['Test constraint']
      }

      const response = await api.generatePrompt(request)
      
      expect(response.success).toBe(true)
      expect(response.data).toBeDefined()
      expect(response.request_id).toBeDefined()
      expect(response.timestamp).toBeDefined()
    })

    it('should validate prompts via API', async () => {
      const request = {
        prompt: { role: 'Assistant', goals: ['Help'] },
        domain: 'chat'
      }

      const response = await api.validatePrompt(request)
      
      expect(response.success).toBe(true)
      expect(response.data?.valid).toBe(true)
    })

    it('should provide domain information', async () => {
      const response = await api.getDomainInfo('chat')
      
      expect(response.success).toBe(true)
      expect(response.data?.domain).toBe('chat')
      expect(response.data?.requiredFields).toContain('role')
      expect(response.data?.defaultValues).toBeDefined()
    })

    it('should handle health checks', async () => {
      const response = await api.healthCheck()
      
      expect(response.success).toBe(true)
      expect(response.data?.status).toBe('healthy')
      expect(response.data?.domains).toBeGreaterThan(0)
    })

    it('should handle invalid requests gracefully', async () => {
      const invalidRequest = {
        domain: '', // Empty domain
        task_description: ''
      }

      const response = await api.generatePrompt(invalidRequest)
      
      expect(response.success).toBe(false)
      expect(response.error).toContain('Invalid request')
    })
  })

  describe('Integration Tests', () => {
    it('should complete full generation workflow', async () => {
      // 1. Generate prompt
      const input = {
        domain: 'chat',
        task_description: 'Create a coding assistant',
        constraints: ['Use TypeScript'],
        auto_repair: true
      }

      const generated = await generator.generatePrompt(input)
      expect(generated.validation.valid).toBe(true)

      // 2. Validate the generated prompt
      const chatAdapter = generator.getDomainAdapter('chat')
      const validation = generator.validatePrompt(generated.prompt, chatAdapter!.schema)
      expect(validation.valid).toBe(true)

      // 3. Export configuration
      const config = generator.exportConfiguration()
      expect(config.domains).toContain('chat')
      expect(config.metadata.version).toBeDefined()
    })

    it('should handle auto-repair for invalid prompts', async () => {
      const input = {
        domain: 'chat',
        task_description: 'Test repair',
        variables: { role: null }, // Invalid value that should be repaired
        auto_repair: true
      }

      const result = await generator.generatePrompt(input)
      
      // Should either be valid after repair or contain repair metadata
      expect(result.meta.provenance?.repair_attempts).toBeDefined()
    })
  })

  describe('Error Handling', () => {
    it('should handle template compilation errors', () => {
      const invalidTemplate = '{"key": {{invalid syntax}}'
      const context = {
        variables: {},
        defaults: {},
        conditionals: {}
      }

      expect(() => {
        templateEngine.renderJsonTemplate(invalidTemplate, context)
      }).toThrow()
    })

    it('should handle schema validation errors', () => {
      const invalidPrompt = { role: 123 } // Should be string
      const schema = {
        type: 'object',
        properties: { role: { type: 'string' } },
        required: ['role']
      }

      const result = generator.validatePrompt(invalidPrompt, schema)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })
})

describe('Performance Tests', () => {
  it('should generate prompts quickly', async () => {
    const generator = new JsonPromptGenerator()
    const start = performance.now()

    await generator.generatePrompt({
      domain: 'chat',
      task_description: 'Quick test'
    })

    const duration = performance.now() - start
    expect(duration).toBeLessThan(100) // Should complete in under 100ms
  })

  it('should handle multiple concurrent requests', async () => {
    const generator = new JsonPromptGenerator()
    const requests = Array(10).fill(null).map((_, i) => 
      generator.generatePrompt({
        domain: 'chat',
        task_description: `Test ${i}`
      })
    )

    const results = await Promise.all(requests)
    results.forEach((result, i) => {
      expect(result.validation.valid).toBe(true)
      expect(result.prompt).toBeDefined()
    })
  })
})
