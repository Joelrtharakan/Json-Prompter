# Contributing to Dynamic JSON Prompt Generator

Thank you for your interest in contributing! This guide will help you get started.

## 🚀 Quick Start

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/json-prompt-generator.git
   cd json-prompt-generator
   ```

2. **Setup Development Environment**
   ```bash
   ./setup.sh
   ```

3. **Start Development Servers**
   ```bash
   # Terminal 1: Backend
   cd backend && npm run dev
   
   # Terminal 2: Frontend  
   npm run dev
   ```

## 📁 Project Structure

```
├── src/                          # Frontend source code
│   ├── components/               # React components
│   │   ├── DynamicJsonGenerator/ # Main component
│   │   └── ...
│   ├── services/                 # API and business logic
│   │   └── llmService.ts        # LLM integration
│   └── ...
├── backend/                      # Backend API
│   ├── index.js                 # Express server
│   └── package.json
├── docs/                        # Documentation
└── ...
```

## 🛠️ Development Guidelines

### Code Style

- **TypeScript**: Use strict type checking
- **React**: Functional components with hooks
- **CSS**: CSS Modules with CSS Variables
- **Naming**: camelCase for variables, PascalCase for components

### Component Guidelines

```tsx
// Good: Functional component with proper typing
interface MyComponentProps {
  title: string;
  onSubmit: (data: any) => void;
}

const MyComponent: React.FC<MyComponentProps> = ({ title, onSubmit }) => {
  const [data, setData] = useState<any>(null);
  
  return (
    <div className="my-component">
      <h2>{title}</h2>
      {/* Component content */}
    </div>
  );
};
```

### Service Guidelines

```typescript
// Good: Service with proper error handling
class ApiService {
  async fetchData(): Promise<ApiResponse> {
    try {
      const response = await fetch('/api/data');
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }
}
```

## 🎯 Areas for Contribution

### High Priority
- [ ] Additional LLM provider support (Anthropic Claude, etc.)
- [ ] JSON schema validation improvements
- [ ] Better error handling and user feedback
- [ ] Performance optimizations

### Medium Priority
- [ ] Offline mode with local models
- [ ] Template system for common patterns
- [ ] Batch processing capabilities
- [ ] Export formats (YAML, XML, etc.)

### Low Priority
- [ ] Dark/light theme toggle
- [ ] Keyboard shortcuts
- [ ] Mobile app version
- [ ] Plugin system

## 🧪 Testing

### Running Tests
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

### Writing Tests
```typescript
// Component tests
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

test('renders component correctly', () => {
  render(<MyComponent title="Test" onSubmit={jest.fn()} />);
  expect(screen.getByText('Test')).toBeInTheDocument();
});

// Service tests
import { llmService } from '../services/llmService';

test('converts prompt correctly', async () => {
  const result = await llmService.mockConvertPromptToJSON('test prompt');
  expect(result.success).toBe(true);
  expect(result.json).toBeDefined();
});
```

## 🔧 Backend Development

### Adding New LLM Providers

1. **Update the service:**
   ```javascript
   // backend/index.js
   async function callNewProvider(prompt, apiKey, model) {
     // Implementation
   }
   ```

2. **Add to switch statement:**
   ```javascript
   case 'newprovider':
     jsonResult = await callNewProvider(prompt, apiKey, model);
     break;
   ```

3. **Update frontend:**
   ```typescript
   // src/services/llmService.ts
   const providerOptions = [
     // ... existing providers
     { name: 'newprovider', displayName: 'New Provider', model: 'default-model' },
   ];
   ```

### API Endpoints

- `GET /health` - Health check
- `POST /convert` - Convert prompt to JSON
- `GET /examples` - Get example prompts

## 🎨 Frontend Development

### Adding New Components

1. **Create component file:**
   ```tsx
   // src/components/NewComponent.tsx
   interface NewComponentProps {
     // Props interface
   }
   
   const NewComponent: React.FC<NewComponentProps> = (props) => {
     // Component implementation
   };
   
   export default NewComponent;
   ```

2. **Create styles:**
   ```css
   /* src/components/NewComponent.css */
   .new-component {
     /* Component styles */
   }
   ```

3. **Add to main component:**
   ```tsx
   import NewComponent from './components/NewComponent';
   ```

### Styling Guidelines

- Use CSS Variables for theming
- Follow glassmorphism design pattern
- Ensure responsive design
- Include hover and focus states

```css
.component {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  transition: var(--transition-normal);
}

.component:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-3d);
}
```

## 📝 Documentation

### Code Documentation
- Add JSDoc comments for functions
- Include examples in documentation
- Document complex logic

```typescript
/**
 * Converts a natural language prompt to structured JSON
 * @param prompt - The natural language input
 * @param provider - LLM provider configuration
 * @returns Promise resolving to conversion result
 * @example
 * ```typescript
 * const result = await convertPrompt("Create a user", { name: 'openai' });
 * ```
 */
async function convertPrompt(prompt: string, provider: LLMProvider): Promise<ConvertResponse> {
  // Implementation
}
```

### README Updates
- Keep examples current
- Update feature lists
- Add new screenshots/GIFs

## 🚀 Deployment

### Frontend (Vercel)
```bash
npm run build        # Build for production
vercel --prod       # Deploy to production
```

### Backend (Railway/Render)
```bash
# Set environment variables
OPENAI_API_KEY=your_key
GEMINI_API_KEY=your_key

# Deploy
git push origin main
```

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Environment**: OS, Node version, browser
2. **Steps to reproduce**: Clear step-by-step instructions
3. **Expected behavior**: What should happen
4. **Actual behavior**: What actually happens
5. **Screenshots**: If applicable
6. **Console errors**: Any error messages

## 💡 Feature Requests

For new features, please include:

1. **Use case**: Why is this needed?
2. **Description**: What should it do?
3. **Implementation ideas**: How might it work?
4. **Priority**: How important is this?

## 📋 Pull Request Process

1. **Create feature branch**: `git checkout -b feature/new-feature`
2. **Make changes**: Follow coding guidelines
3. **Add tests**: Cover new functionality
4. **Update docs**: Include relevant documentation
5. **Test thoroughly**: Ensure nothing breaks
6. **Submit PR**: Include description and context

### PR Checklist
- [ ] Code follows project style guidelines
- [ ] Tests pass locally
- [ ] Documentation updated
- [ ] No console errors
- [ ] Responsive design tested
- [ ] Accessibility considered

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Social media shoutouts

## 📞 Getting Help

- **GitHub Issues**: For bugs and features
- **GitHub Discussions**: For questions and ideas
- **Email**: project-email@example.com

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to the Dynamic JSON Prompt Generator! 🎉
