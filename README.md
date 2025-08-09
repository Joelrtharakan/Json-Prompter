# Claude AI JSON Generator

A powerful and intuitive web application that transforms natural language descriptions into structured JSON using Claude 3.5 Sonnet AI. Built with React, TypeScript, and modern web technologies.

## ✨ Features

- **Natural Language to JSON**: Convert plain English descriptions into structured JSON
- **Claude 3.5 Sonnet Integration**: Powered by Anthropic's most capable AI model
- **Real-time Generation**: Instant JSON responses with proper formatting
- **Clean Interface**: Simple, focused UI without complexity
- **History Management**: Keep track of your prompt history
- **Copy & Export**: Easy copying and downloading of generated JSON
- **Responsive Design**: Works seamlessly on desktop and mobile

## 🚀 Live Demo

Transform prompts like:
> "Create a user profile with name, email, age, and a list of hobbies"

Into clean JSON:
```json
{
  "name": "string",
  "email": "string", 
  "age": "number",
  "hobbies": ["string"]
}
```

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Node.js, Express
- **AI**: Claude 3.5 Sonnet via OpenRouter
- **Styling**: Modern CSS with glassmorphism design
- **Icons**: Lucide React

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenRouter API key

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/claude-json-generator.git
   cd claude-json-generator
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   cd ..
   ```

3. **Configure environment**
   ```bash
   # Create backend environment file
   cp backend/.env.example backend/.env
   ```
   
   Edit `backend/.env` and add your OpenRouter API key:
   ```env
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   ```

4. **Start the application**
   ```bash
   # Start backend server (in one terminal)
   cd backend
   npm run dev
   
   # Start frontend (in another terminal)
   cd ..
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` to use the application

## 🔑 Getting an OpenRouter API Key

1. Visit [OpenRouter.ai](https://openrouter.ai)
2. Sign up for an account
3. Navigate to the API Keys section
4. Generate a new API key
5. Add it to your `backend/.env` file

## 💡 Usage

1. **Enter a prompt**: Describe what kind of JSON structure you need
2. **Generate**: Click the generate button to create your JSON
3. **Copy/Download**: Use the action buttons to copy or save your result
4. **History**: Access your previous generations from the history panel

### Example Prompts

- "Create a product catalog item with name, price, description, and categories"
- "Design a blog post structure with title, content, author, and metadata"
- "Build a task management object with priority, due date, and assignees"

## 🏗️ Project Structure

```
claude-json-generator/
├── src/
│   ├── components/
│   │   ├── DynamicJsonGenerator.tsx    # Main component
│   │   ├── ErrorBoundary.tsx           # Error handling
│   │   └── Toast.tsx                   # Notifications
│   ├── services/
│   │   └── llmService.ts               # API integration
│   ├── contexts/
│   │   └── ArchitectureContext.tsx     # State management
│   └── utils/                          # Utility functions
├── backend/
│   ├── index.js                        # Express server
│   └── .env                            # Environment config
└── public/                             # Static assets
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Anthropic](https://anthropic.com) for Claude 3.5 Sonnet
- [OpenRouter](https://openrouter.ai) for API access
- [React](https://react.dev) team for the amazing framework
- [Vite](https://vitejs.dev) for the lightning-fast build tool

## 📧 Support

If you have any questions or need help, please open an issue or contact [your-email@example.com](mailto:your-email@example.com).

---

**Built with ❤️ using Claude 3.5 Sonnet**
