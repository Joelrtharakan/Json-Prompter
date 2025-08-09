// Simple test to check if the prompt generator is working
import { JsonPromptGenerator } from './src/core/promptGenerator.js'

const generator = new JsonPromptGenerator()

console.log('🧪 Testing JSON Prompt Generator...\n')

// Test with a simple chat prompt
const testInput = {
  domain: 'chat',
  task_description: 'Help me write a simple function',
  constraints: ['Use TypeScript', 'Add error handling'],
  variables: {
    function_name: 'calculateSum',
    parameters: 'a: number, b: number'
  }
}

try {
  console.log('📥 Input:', JSON.stringify(testInput, null, 2))
  
  const result = await generator.generatePrompt(testInput)
  
  console.log('✅ Success! Generated prompt:')
  console.log(JSON.stringify(result, null, 2))
  
} catch (error) {
  console.error('❌ Error:', error.message)
  console.error('Stack:', error.stack)
}
