# Perplexity Tool for Claude Desktop

A custom MCP tool that integrates Perplexity AI's API with Claude Desktop, allowing Claude to perform web-based research and provide answers with citations.

## Prerequisites Installation

1. Install Git:
   - For Mac: 
     - Install [Homebrew](https://brew.sh/) first by pasting this in Terminal:
     ```bash
     /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
     ```
     - Then install Git:
     ```bash
     brew install git
     ```
   - For Windows:
     - Download Git from [git-scm.com](https://git-scm.com/downloads)
     - Run the installer

2. Install Node.js:
   - For Mac: 
     ```bash
     brew install node
     ```
   - For Windows:
     - Download from [nodejs.org](https://nodejs.org/)
     - Run the installer

3. Verify installations by running:
```bash
git --version
node --version
```

## Tool Installation

1. Clone the repository
```bash
git clone https://github.com/letsbuildagent/perplexity-tool
cd perplexity-tool
```

2. Install dependencies
```bash
npm install
```

3. Set up your API Key

You have two options:

Option 1 (Quick setup):
- Open `server.js`
- Find this line:
```javascript
const PERPLEXITY_API_KEY = "YOUR-API-KEY-HERE";
```
- Replace with your Perplexity API key

Option 2 (Best practice):
- Create a .env file:
  ```bash
  # On Mac/Linux:
  touch .env
  open .env
  
  # On Windows:
  notepad .env
  ```
  Or simply create a new file named `.env` in your text editor
- Add your API key to the .env file:
  ```
  PERPLEXITY_API_KEY=your-api-key-here
  ```
- Install dotenv:
  ```bash
  npm install dotenv
  ```
- Update server.js:
  ```javascript
  import 'dotenv/config'
  const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
  ```

4. Configure Claude Desktop
- Open `~/Library/Application Support/Claude/claude_desktop_config.json`
- Add this configuration:
```json
{
  "mcpServers": {
    "perplexity-tool": {
      "command": "node",
      "args": [
        "/full/path/to/perplexity-tool/server.js"
      ]
    }
  }
}
```
Replace `/full/path/to` with the actual path where you cloned the repository.

5. Restart Claude Desktop

## Usage

Once installed, you can use the tool through Claude with commands like:

- "Ask Perplexity about recent developments in AI"
- "Use Perplexity to research the history of quantum computing"
- "Search Perplexity for information about climate change, focusing on the last month"

### Advanced Options

You can specify additional parameters:
- `temperature`: Controls response randomness (0-2)
- `max_tokens`: Limits response length
- `search_domain_filter`: Restricts search to specific domains
- `search_recency_filter`: Filters by time period (day/week/month/year)

## Troubleshooting

1. Git not found:
   - Make sure you've installed Git correctly
   - Try restarting your terminal
   - On Mac, make sure Homebrew is in your PATH

2. Node.js errors:
   - Verify Node.js installation with `node --version`
   - Try reinstalling Node.js

3. API Key issues:
   - Make sure you've correctly copied your API key
   - Check that there are no extra spaces in your .env file
   - If using Option 2, verify dotenv is installed

4. Tool not appearing in Claude:
   - Check the path in claude_desktop_config.json
   - Make sure the path points to your server.js file
   - Restart Claude Desktop
   - Check the console for any error messages

## License

MIT

## Security Note

If you're planning to share your code or make it public:
- Don't commit your API key to Git
- Use the .env method (Option 2)
- Add .env to your .gitignore file
