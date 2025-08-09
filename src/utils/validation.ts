import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import type { JsonField } from '../contexts/ArchitectureContext'

const ajv = new Ajv({ allErrors: true })
addFormats(ajv)

export interface ValidationResult {
  valid: boolean
  errors: Array<{
    path: string
    message: string
    value?: any
  }>
}

export function validateJsonWithSchema(data: any, schema: object): ValidationResult {
  const validate = ajv.compile(schema)
  const valid = validate(data)
  
  if (valid) {
    return { valid: true, errors: [] }
  }
  
  const errors = (validate.errors || []).map(error => ({
    path: error.instancePath || error.schemaPath,
    message: error.message || 'Unknown error',
    value: error.data
  }))
  
  return { valid: false, errors }
}

export function validateJsonString(jsonString: string): ValidationResult {
  try {
    JSON.parse(jsonString)
    return { valid: true, errors: [] }
  } catch (error) {
    return {
      valid: false,
      errors: [{
        path: 'root',
        message: error instanceof Error ? error.message : 'Invalid JSON format'
      }]
    }
  }
}

export function generateJsonSchemaFromFields(fields: JsonField[]): any {
  // Enhanced schema generation with better type handling
  const schema: any = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: {},
    required: [],
    additionalProperties: false
  }

  fields.forEach(field => {
    const property: any = {
      type: field.type === 'integer' ? 'integer' : field.type,
      title: field.title || field.name,
      description: field.description || ''
    }

    // Enhanced type-specific configurations
    switch (field.type) {
      case 'string':
        if (field.enum && field.enum.length > 0) {
          property.enum = field.enum
        }
        if (field.pattern) {
          property.pattern = field.pattern
        }
        if (field.minLength !== undefined) property.minLength = field.minLength
        if (field.maxLength !== undefined) property.maxLength = field.maxLength
        if (field.format) property.format = field.format
        break
      
      case 'number':
      case 'integer':
        if (field.minimum !== undefined) property.minimum = field.minimum
        if (field.maximum !== undefined) property.maximum = field.maximum
        if (field.multipleOf !== undefined) property.multipleOf = field.multipleOf
        break
      
      case 'array':
        property.items = field.items || { type: 'string' }
        if (field.minItems !== undefined) property.minItems = field.minItems
        if (field.maxItems !== undefined) property.maxItems = field.maxItems
        if (field.uniqueItems) property.uniqueItems = true
        break
      
      case 'object':
        if (field.properties && field.properties.length > 0) {
          const nestedSchema = generateJsonSchemaFromFields(field.properties)
          property.properties = nestedSchema.properties
          if (nestedSchema.required.length > 0) {
            property.required = nestedSchema.required
          }
        }
        break
    }

    if (field.default !== undefined) {
      property.default = field.default
    }

    if (field.examples && field.examples.length > 0) {
      property.examples = field.examples
    }

    schema.properties[field.name] = property

    if (field.required) {
      schema.required.push(field.name)
    }
  })

  return schema
}
