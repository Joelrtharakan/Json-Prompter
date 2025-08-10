export interface TemplateContext {
  variables: Record<string, any>
  defaults: Record<string, any>
  conditionals: Record<string, boolean>
}

export class TemplateEngine {
  private helpers: Map<string, Function> = new Map()
  private partials: Map<string, string> = new Map()

  constructor() {
    this.registerBuiltinHelpers()
  }

  private registerBuiltinHelpers() {
    // JSON helper for safe JSON stringification
    this.helpers.set('json', (context: any) => {
      return JSON.stringify(context, null, 2)
    })

    // Default value helper
    this.helpers.set('default', (value: any, defaultValue: any) => {
      return value != null ? value : defaultValue
    })

    // Array join helper
    this.helpers.set('join', (array: any, separator: string = ', ') => {
      return Array.isArray(array) ? array.join(separator) : ''
    })

    // Capitalize helper
    this.helpers.set('capitalize', (str: any) => {
      return typeof str === 'string' ? str.charAt(0).toUpperCase() + str.slice(1) : str
    })

    // Format date helper
    this.helpers.set('formatDate', (date: any, format: string = 'iso') => {
      if (!date) return ''
      const d = new Date(date)
      if (format === 'iso') return d.toISOString()
      if (format === 'short') return d.toLocaleDateString()
      return d.toString()
    })
  }

  /**
   * Simple template compilation with {{variable}} syntax
   */
  compile(templateString: string, context: TemplateContext): string {
    try {
      // Merge defaults with variables, with variables taking precedence
      const mergedContext = {
        ...context.defaults,
        ...context.variables,
        ...context.conditionals
      }

      let result = templateString

      // Handle conditionals: {{#if condition}}content{{/if}}
      result = this.processConditionals(result, mergedContext)
      
      // Handle helpers: {{helper value}}
      result = this.processHelpers(result, mergedContext)
      
      // Handle simple variable substitution: {{variable}}
      result = this.processVariables(result, mergedContext)

      return result
    } catch (error) {
      throw new Error(`Template compilation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private processConditionals(template: string, context: Record<string, any>): string {
    // Handle {{#if condition}}content{{/if}}
    const ifRegex = /\{\{#if\s+(\w+)\}\}(.*?)\{\{\/if\}\}/gs
    return template.replace(ifRegex, (_, condition, content) => {
      return context[condition] ? content : ''
    })
  }

  private processHelpers(template: string, context: Record<string, any>): string {
    // Handle {{helper value}} syntax
    const helperRegex = /\{\{(\w+)\s+([\w.]+)\}\}/g
    return template.replace(helperRegex, (match, helperName, valuePath) => {
      const helper = this.helpers.get(helperName)
      if (helper) {
        const value = this.getValueFromPath(context, valuePath)
        return helper(value)
      }
      return match
    })
  }

  private processVariables(template: string, context: Record<string, any>): string {
    // Handle {{variable}} and {{object.property}} syntax
    const variableRegex = /\{\{([\w.]+)\}\}/g
    return template.replace(variableRegex, (match, path) => {
      const value = this.getValueFromPath(context, path)
      return value !== undefined ? String(value) : match
    })
  }

  private getValueFromPath(obj: Record<string, any>, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined
    }, obj)
  }

  /**
   * Parse and render a JSON template
   */
  renderJsonTemplate(templateString: string, context: TemplateContext): any {
    try {
      const rendered = this.compile(templateString, context)
      return JSON.parse(rendered)
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON generated from template: ${error.message}`)
      }
      throw error
    }
  }

  /**
   * Validate template syntax without rendering
   */
  validateTemplate(templateString: string): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    try {
      // Check for balanced braces
      const openBraces = (templateString.match(/\{\{/g) || []).length
      const closeBraces = (templateString.match(/\}\}/g) || []).length
      
      if (openBraces !== closeBraces) {
        errors.push('Unbalanced template braces')
      }

      // Additional validation for JSON templates
      if (templateString.trim().startsWith('{') || templateString.trim().startsWith('[')) {
        // Try to render with minimal context to check JSON structure
        try {
          const testContext: TemplateContext = {
            variables: {},
            defaults: {},
            conditionals: {}
          }
          const rendered = this.compile(templateString, testContext)
          JSON.parse(rendered)
        } catch (jsonError) {
          errors.push(`Template generates invalid JSON: ${jsonError instanceof Error ? jsonError.message : 'Unknown JSON error'}`)
        }
      }
    } catch (templateError) {
      errors.push(`Template syntax error: ${templateError instanceof Error ? templateError.message : 'Unknown template error'}`)
    }

    return { valid: errors.length === 0, errors }
  }

  /**
   * Extract variables used in a template
   */
  extractVariables(templateString: string): string[] {
    const variables = new Set<string>()
    
    // Extract variables from {{variable}} patterns
    const variableRegex = /\{\{(?:#if\s+)?(?:\w+\s+)?([\w.]+)\}\}/g
    let match

    while ((match = variableRegex.exec(templateString)) !== null) {
      const variable = match[1].split('.')[0] // Get root variable name
      if (!this.helpers.has(variable)) {
        variables.add(variable)
      }
    }

    return Array.from(variables)
  }

  /**
   * Create a partial template for reuse
   */
  registerPartial(name: string, template: string): void {
    this.partials.set(name, template)
  }

  /**
   * Get all registered partials
   */
  getPartials(): Record<string, string> {
    return Object.fromEntries(this.partials)
  }

  /**
   * Create template with error handling and sanitization
   */
  createSafeTemplate(templateString: string): {
    render: (context: TemplateContext) => any
    validate: () => { valid: boolean; errors: string[] }
    variables: string[]
  } {
    const validation = this.validateTemplate(templateString)
    const variables = this.extractVariables(templateString)

    return {
      render: (context: TemplateContext) => {
        // Sanitize context to prevent code injection
        const sanitizedContext: TemplateContext = {
          variables: this.sanitizeContext(context.variables),
          defaults: this.sanitizeContext(context.defaults),
          conditionals: context.conditionals
        }

        return this.renderJsonTemplate(templateString, sanitizedContext)
      },
      validate: () => validation,
      variables
    }
  }

  /**
   * Sanitize context values to prevent template injection
   */
  private sanitizeContext(obj: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {}

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        // Basic sanitization - remove template syntax
        sanitized[key] = value.replace(/\{\{.*?\}\}/g, '')
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(item => 
          typeof item === 'string' ? item.replace(/\{\{.*?\}\}/g, '') : item
        )
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeContext(value)
      } else {
        sanitized[key] = value
      }
    }

    return sanitized
  }
}

// Template library for common patterns
export const TemplateLibrary = {
  // Basic JSON object template
  basicObject: `{
  "role": "{{role}}",
  "goals": {{json goals}},
  {{#if constraints}}"constraints": {{json constraints}},{{/if}}
  "meta": {
    "generated_at": "{{formatDate now}}",
    "version": "{{version}}"
  }
}`,

  // Conditional fields template
  conditionalFields: `{
  "required_field": "{{required_field}}",
  {{#if optional_field}}"optional_field": "{{optional_field}}",{{/if}}
  "timestamp": "{{formatDate now}}"
}`,

  // Array template
  arrayTemplate: `[
  {{json items}}
]`,

  // Nested object template
  nestedObject: `{
  "meta": {
    "generated_at": "{{formatDate now}}",
    "version": "{{default version '1.0.0'}}"
  },
  "data": {{json data}}
}`
}
