// 🎯 JSON Prompt Generator - Usage Examples
// Run with: node examples/generate-prompts.js

import { JsonPromptGenerator } from '../src/core/promptGenerator.js';
import { DomainRegistry } from '../src/domains/adapters.js';

// Initialize the generator
const generator = new JsonPromptGenerator();

console.log('🚀 JSON Prompt Generator Examples\n');

// ========================================
// Example 1: Chat/Code Domain
// ========================================
console.log('📝 Example 1: Chat/Code Domain');
const chatInput = {
  domain: 'chat',
  task_description: 'Help me build a React component',
  constraints: ['Use TypeScript', 'Follow React best practices'],
  variables: {
    component_name: 'UserProfile',
    props: ['name', 'email', 'avatar']
  }
};

try {
  const chatResult = await generator.generatePrompt(chatInput);
  console.log('✅ Generated Chat Prompt:');
  console.log(JSON.stringify(chatResult.prompt, null, 2));
  console.log('\n---\n');
} catch (error) {
  console.error('❌ Chat generation failed:', error.message);
}

// ========================================
// Example 2: Image Domain
// ========================================
console.log('🎨 Example 2: Image Domain');
const imageInput = {
  domain: 'image',
  task_description: 'Create a stunning landscape photo',
  variables: {
    subject: 'Mountain lake at sunset',
    mood: 'peaceful and serene',
    style: 'photorealistic'
  }
};

try {
  const imageResult = await generator.generatePrompt(imageInput);
  console.log('✅ Generated Image Prompt:');
  console.log(JSON.stringify(imageResult.prompt, null, 2));
  console.log('\n---\n');
} catch (error) {
  console.error('❌ Image generation failed:', error.message);
}

// ========================================
// Example 3: Music Domain
// ========================================
console.log('🎵 Example 3: Music Domain');
const musicInput = {
  domain: 'music',
  task_description: 'Compose ambient background music',
  variables: {
    genre: 'ambient',
    bpm: 70,
    mood: 'contemplative',
    instruments: ['synthesizer', 'piano']
  }
};

try {
  const musicResult = await generator.generatePrompt(musicInput);
  console.log('✅ Generated Music Prompt:');
  console.log(JSON.stringify(musicResult.prompt, null, 2));
  console.log('\n---\n');
} catch (error) {
  console.error('❌ Music generation failed:', error.message);
}

// ========================================
// Example 4: Video Domain
// ========================================
console.log('🎬 Example 4: Video Domain');
const videoInput = {
  domain: 'video',
  task_description: 'Create a cooking tutorial video',
  variables: {
    who: 'Professional chef',
    where: 'Modern kitchen',
    what: 'Making pasta from scratch',
    duration: '5:00'
  }
};

try {
  const videoResult = await generator.generatePrompt(videoInput);
  console.log('✅ Generated Video Prompt:');
  console.log(JSON.stringify(videoResult.prompt, null, 2));
  console.log('\n---\n');
} catch (error) {
  console.error('❌ Video generation failed:', error.message);
}

// ========================================
// Example 5: Custom Schema
// ========================================
console.log('🔧 Example 5: Custom Schema');
const customInput = {
  domain: 'chat',
  task_description: 'Custom prompt with user schema',
  user_schema: {
    type: 'object',
    properties: {
      custom_field: { type: 'string' },
      priority: { type: 'number', minimum: 1, maximum: 10 }
    },
    required: ['custom_field']
  },
  variables: {
    custom_field: 'My custom value',
    priority: 8
  }
};

try {
  const customResult = await generator.generatePrompt(customInput);
  console.log('✅ Generated Custom Prompt:');
  console.log(JSON.stringify(customResult.prompt, null, 2));
  console.log('\n---\n');
} catch (error) {
  console.error('❌ Custom generation failed:', error.message);
}

// ========================================
// Example 6: Auto-Repair Demo
// ========================================
console.log('🔧 Example 6: Auto-Repair Demo');
const brokenInput = {
  domain: 'chat',
  task_description: 'Test auto-repair',
  variables: {
    role: 123, // Wrong type - should be string
    goals: 'single string instead of array' // Wrong type
  }
};

try {
  const repairedResult = await generator.generatePrompt(brokenInput);
  console.log('✅ Auto-Repaired Prompt:');
  console.log(JSON.stringify(repairedResult.prompt, null, 2));
  console.log('🔧 Repair attempts:', repairedResult.meta.provenance.repair_attempts);
} catch (error) {
  console.error('❌ Auto-repair failed:', error.message);
}

console.log('\n🎉 All examples completed!');
console.log('💡 Visit http://localhost:5174 to use the web interface');
