# CodeSentinel

A powerful VS Code extension that provides intelligent code review capabilities with both AI-powered analysis and offline rule-based validation. Get comprehensive code feedback that combines the depth of AI reasoning with the reliability of predefined best practices.

## 🚀 Features

### AI-Powered Code Review
- **OpenAI Integration**: Leverage GPT models for deep code analysis and suggestions
- **Intelligent Insights**: Get context-aware recommendations for code quality, architecture, and best practices
- **Configurable Models**: Support for various OpenAI models (GPT-4, GPT-3.5-turbo, etc.)

### Offline Fallback System
- **Rule-Based Analysis**: Comprehensive offline code review using predefined rules
- **No Internet Required**: Works completely offline when AI services are unavailable
- **Instant Feedback**: Fast analysis without API calls or waiting times

### Multi-Language Support
- **Frontend**: React, Flutter, Next.js, Angular
- **Backend**: Node.js, Express, NestJS, Spring Boot, Go, Java, C++
- **Full Stack**: REST API, GraphQL, MongoDB, PostgreSQL

### Comprehensive Analysis Areas
- **Code Quality**: Clean code principles, readability, maintainability
- **Architecture**: Separation of concerns, design patterns, scalability
- **Security**: Data validation, vulnerability prevention
- **Performance**: Optimization opportunities, resource usage
- **Best Practices**: Framework-specific guidelines and conventions

## 📦 Installation

1. Download the `.vsix` file from the releases
2. Open VS Code
3. Go to Extensions → Install from VSIX
4. Select the downloaded file

## ⚙️ Configuration

### OpenAI Setup (Optional)
Configure your OpenAI API key for AI-powered reviews:

```json
{
  "codeSentinel.openaiApiKey": "your-openai-api-key-here",
  "codeSentinel.openaiModel": "gpt-4o-mini"
}
```

### Settings
- **API Key**: Your OpenAI API key (machine-scoped for security)
- **Model**: Choose your preferred OpenAI model (default: gpt-4o-mini)

## 🛠️ Usage

### Review Current File
1. Open any code file in VS Code
2. Use Command Palette: `Ctrl+Shift+P` (Mac: `Cmd+Shift+P`)
3. Run: `CodeSentinel: Review Current File`
4. Select your code scope (frontend/backend/both)
5. Choose your tech stack
6. Get instant code review results

### How It Works

The extension uses a smart two-tier approach prioritizing reliability:

1. **Primary**: Always performs fast, reliable offline rule-based analysis
2. **Enhancement**: Optionally enhances results with AI-powered insights when available
3. **Hybrid**: Guaranteed offline results with optional AI enhancement

## 📋 Review Output

### AI Review Format
```
## Summary

## Critical Issues
- [Severity: HIGH] Issue description

## Improvements

## Best Practice Recommendations

## Suggested Refactor (if any)
```

### Offline Review Format
```
## 🔍 Offline Multi-File Code Review

**Files Reviewed:** X
**Language:** TypeScript
**Scope:** Frontend
**Tech Stack:** React, Next.js

- **BLOCKER** [RULE-ID] (file-path)
  - Rule description
  - Principle: SRP/DRY/etc.
  - Rationale: Explanation
```

## 🔧 Supported Languages & Frameworks

### Frontend
- **React**: Component design, hooks usage, state management
- **Flutter**: Widget architecture, state management, performance
- **Next.js**: SSR/SSG patterns, API routes, optimization
- **Angular**: Component architecture, dependency injection

### Backend
- **Node.js/Express**: Middleware patterns, error handling, security
- **NestJS**: Module structure, dependency injection, decorators
- **Spring Boot**: Layered architecture, bean management, REST
- **Go**: Concurrency patterns, error handling, interfaces
- **Java**: OOP principles, exception handling, design patterns
- **C++**: Memory management, RAII, performance optimization

### Databases & APIs
- **REST API**: HTTP methods, status codes, error responses
- **GraphQL**: Schema design, resolver patterns, performance
- **MongoDB**: Schema design, indexing, aggregation
- **PostgreSQL**: Normalization, indexing, query optimization

## 🏗️ Architecture

```
src/
├── commands/          # VS Code commands
├── engine/           # Rule matching and execution
├── rules/            # Language/framework specific rules
│   ├── frontend/     # React, Flutter, etc.
│   └── backend/      # Go, Java, C++, etc.
├── services/         # AI and fallback services
├── types/            # TypeScript definitions
└── extension.ts      # Main extension entry point
```

## 📊 Rule Categories

### Severity Levels
- **BLOCKER**: Critical issues that prevent proper functioning
- **CRITICAL**: High-impact issues affecting reliability
- **MAJOR**: Important improvements for quality
- **MINOR**: Style and convention improvements
- **INFO**: Informational suggestions

### Quality Principles
- **SRP**: Single Responsibility Principle
- **DRY**: Don't Repeat Yourself
- **SOLID**: Object-oriented design principles
- **KISS**: Keep It Simple, Stupid
- **YAGNI**: You Aren't Gonna Need It

## 🔒 Privacy & Security

- **Offline-First**: All code analysis can work without internet
- **Local Processing**: Code never leaves your machine for offline reviews
- **Secure Storage**: API keys stored securely in VS Code settings
- **No Data Collection**: No telemetry or code uploaded to external servers

## 🤝 Contributing

### Adding New Rules
1. Create rule files in appropriate language/framework directories
2. Follow the `ReviewRule` interface structure
3. Add tests for rule validation
4. Update the rules index

### Rule Structure
```typescript
{
  id: "UNIQUE-RULE-ID",
  area: "Component Design",
  principle: "SRP",
  severity: "BLOCKER",
  appliesTo: { framework: ["react"], scope: ["frontend"] },
  check: (code) => boolean, // Validation logic
  message: "Clear error message",
  rationale: "Why this rule matters"
}
```

## 📝 Development

### Prerequisites
- Node.js 16+
- VS Code
- TypeScript

### Setup
```bash
npm install
npm run compile
```

### Testing
```bash
npm run watch  # For development
```

### Building
```bash
npm run vscode:prepublish  # Creates .vsix file
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- OpenAI for providing powerful AI models
- VS Code extension API for the development platform
- Community contributors for rule definitions and improvements

---

**Note**: While AI reviews provide intelligent insights, always use your judgment and consider the specific context of your project. The offline rule system ensures you always have access to code review capabilities, even without internet connectivity.
