// Demo script showcasing the JSON Prompt Generator API capabilities
import { PromptGeneratorAPI, PromptGeneratorCLI } from '../src/api/promptAPI'

async function runDemos() {
  console.log('🎯 JSON Prompt Generator (DynamicArchitecture) Demo\n')
  
  const api = new PromptGeneratorAPI()
  const cli = new PromptGeneratorCLI()

  // Demo 1: Chat/Code Domain
  console.log('📋 Demo 1: Generate Chat/Code Prompt')
  console.log('=====================================')
  
  try {
    const chatResponse = await api.generatePrompt({
      domain: 'chat',
      task_description: 'Create a helpful React TypeScript coding assistant',
      constraints: [
        'Use modern React patterns with hooks',
        'Follow TypeScript best practices',
        'Provide working code examples'
      ],
      style: 'professional',
      variables: {
        role: 'Senior React Developer',
        expertise: 'Frontend Architecture'
      },
      auto_repair: true
    })

    if (chatResponse.success) {
      console.log('✅ Generated Chat Prompt:')
      console.log(JSON.stringify(chatResponse.data?.prompt, null, 2))
      console.log(`\n📊 Validation: ${chatResponse.data?.validation.valid ? '✅ Valid' : '❌ Invalid'}`)
      console.log(`🕒 Generated at: ${chatResponse.data?.meta.generated_at}`)
    }
  } catch (error) {
    console.error('❌ Chat demo failed:', error)
  }

  console.log('\n' + '='.repeat(50) + '\n')

  // Demo 2: Image Domain
  console.log('🖼️ Demo 2: Generate Image Prompt')
  console.log('=================================')
  
  try {
    const imageResponse = await api.generatePrompt({
      domain: 'image',
      task_description: 'Create a serene mountain landscape scene',
      constraints: ['High resolution', 'Natural lighting'],
      variables: {
        subject: 'Snow-capped mountain peak at sunrise',
        mood: {
          emotionalTone: 'peaceful',
          realismLevel: 'photorealistic'
        },
        lighting: {
          type: 'natural',
          temperature: 'warm'
        }
      }
    })

    if (imageResponse.success) {
      console.log('✅ Generated Image Prompt:')
      console.log(JSON.stringify(imageResponse.data?.prompt, null, 2))
    }
  } catch (error) {
    console.error('❌ Image demo failed:', error)
  }

  console.log('\n' + '='.repeat(50) + '\n')

  // Demo 3: Music Domain
  console.log('🎵 Demo 3: Generate Music Prompt')
  console.log('=================================')
  
  try {
    const musicResponse = await api.generatePrompt({
      domain: 'music',
      task_description: 'Compose an ambient background track',
      variables: {
        genre: 'ambient',
        bpm: 75,
        mood: 'calm',
        instruments: ['synthesizer', 'piano', 'strings'],
        duration: '5:00'
      }
    })

    if (musicResponse.success) {
      console.log('✅ Generated Music Prompt:')
      console.log(JSON.stringify(musicResponse.data?.prompt, null, 2))
    }
  } catch (error) {
    console.error('❌ Music demo failed:', error)
  }

  console.log('\n' + '='.repeat(50) + '\n')

  // Demo 4: Video Domain
  console.log('🎬 Demo 4: Generate Video Prompt')
  console.log('=================================')
  
  try {
    const videoResponse = await api.generatePrompt({
      domain: 'video',
      task_description: 'Create a cooking tutorial scene',
      variables: {
        who: 'Professional chef',
        where: 'Modern kitchen studio',
        when: 'afternoon',
        what: {
          camera_actions: ['pan', 'close-up'],
          subject_actions: ['chopping vegetables', 'explaining technique']
        }
      }
    })

    if (videoResponse.success) {
      console.log('✅ Generated Video Prompt:')
      console.log(JSON.stringify(videoResponse.data?.prompt, null, 2))
    }
  } catch (error) {
    console.error('❌ Video demo failed:', error)
  }

  console.log('\n' + '='.repeat(50) + '\n')

  // Demo 5: CLI Interface
  console.log('💻 Demo 5: CLI Interface')
  console.log('========================')
  
  try {
    const domains = await cli.listDomains()
    console.log('📋 Available domains:', domains.join(', '))

    const cliResult = await cli.generate({
      domain: 'chat',
      task: 'Build a simple React component',
      constraints: ['Use TypeScript', 'Include PropTypes'],
      output: 'pretty'
    })

    console.log('\n🎯 CLI Generated Output:')
    console.log(cliResult)
  } catch (error) {
    console.error('❌ CLI demo failed:', error)
  }

  console.log('\n' + '='.repeat(50) + '\n')

  // Demo 6: System Health and Capabilities
  console.log('🔍 Demo 6: System Information')
  console.log('==============================')
  
  try {
    const healthResponse = await api.healthCheck()
    if (healthResponse.success) {
      console.log('✅ System Health:', healthResponse.data)
    }

    const domainsResponse = await api.getDomains()
    if (domainsResponse.success) {
      console.log('📊 Available Domains:', domainsResponse.data)
    }

    const chatInfo = await api.getDomainInfo('chat')
    if (chatInfo.success) {
      console.log('🔧 Chat Domain Info:')
      console.log(`  Required Fields: ${chatInfo.data?.requiredFields.join(', ')}`)
      console.log(`  Available Versions: ${chatInfo.data?.versions.join(', ')}`)
    }
  } catch (error) {
    console.error('❌ System info demo failed:', error)
  }

  console.log('\n🎉 Demo Complete! Visit http://localhost:5174 to try the UI')
  console.log('📚 Check the README.md for comprehensive documentation')
}

// Export for use in other scripts
export { runDemos }

// Run if called directly
if (typeof window === 'undefined') {
  runDemos().catch(console.error)
}
