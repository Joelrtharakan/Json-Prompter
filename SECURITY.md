# Security Setup

## API Key Configuration

This project requires an OpenRouter API key to function. **NEVER commit API keys to version control.**

### Setup Instructions:

1. **Get a new OpenRouter API key:**
   - Visit: https://openrouter.ai/keys
   - Create a new API key
   - Copy the key

2. **Configure the environment:**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit the .env file and add your API key
   VITE_OPENROUTER_API_KEY=your_actual_api_key_here
   ```

3. **Verify the setup:**
   - The `.env` file is already in `.gitignore` and will not be committed
   - Restart your development server after adding the API key
   - The application will show an error if the API key is missing

### Security Notes:

- ✅ API keys are stored in `.env` files (ignored by git)
- ✅ Environment variables are prefixed with `VITE_` for Vite compatibility
- ✅ The application checks for missing API keys
- ❌ Never commit API keys to the repository
- ❌ Never share API keys in public channels

### If You Accidentally Commit an API Key:

1. **Immediately rotate the key** at https://openrouter.ai/keys
2. **Remove the key from git history** using tools like `git filter-branch` or BFG Repo-Cleaner
3. **Update your `.env` file** with the new key
4. **Ensure `.env` is in `.gitignore`**
