# CyberChef Development Instructions

CyberChef is "The Cyber Swiss Army Knife" - a web application for encryption, encoding, compression, and data analysis. It's built with Node.js, Grunt, Webpack, and can be deployed as a web app or used as a Node.js library.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Initial Setup and Dependencies
- **Node.js Version**: Use Node.js 18+ (specified in .nvmrc file). Minimum supported version is 16+.
- **Install Dependencies**:
  ```bash
  npm install
  ```
  **IMPORTANT**: If npm install fails due to chromedriver network issues (common in restricted environments), use:
  ```bash
  npm install --ignore-scripts
  npm run postinstall
  ```

### Build Commands - CRITICAL TIMEOUT WARNINGS

**NEVER CANCEL any build or test commands. All commands below have been validated and WILL complete successfully.**

- **Development Build & Server**:
  ```bash
  npm start
  ```
  **NEVER CANCEL**: Takes 70+ seconds to build and start dev server. Set timeout to 120+ seconds.
  - Runs on http://localhost:8080
  - Includes hot reload and file watching
  - Development builds are larger but faster to rebuild

- **Production Build**:
  ```bash
  npm run build
  ```
  **NEVER CANCEL**: Takes 3+ minutes (180+ seconds) to complete. Set timeout to 300+ seconds.
  - Creates optimized build in `build/prod/`
  - Generates standalone ZIP file
  - Includes bundle analysis report

- **Node.js Library Build**:
  ```bash
  npm run node
  ```
  Takes ~5 seconds. Creates Node.js consumable modules.

### Testing Commands - CRITICAL TIMEOUT WARNINGS

- **Core Tests** (Node API + Operations):
  ```bash
  npm test
  ```
  **NEVER CANCEL**: Takes 12+ seconds to run 1,933 tests. Set timeout to 60+ seconds.
  - Runs Node API tests (217 tests)
  - Runs operation tests (1,716 tests)
  - All tests should pass

- **Node.js Consumer Tests**:
  ```bash
  npm run testnodeconsumer
  ```
  Takes ~10 seconds. Tests CJS and ESM compatibility.

- **Linting**:
  ```bash
  npm run lint
  ```
  Takes ~30 seconds. Runs ESLint on all source files.

- **Grammar Checking**:
  ```bash
  npm run lint:grammar
  ```
  Takes ~30 seconds. Runs cspell - expect many "unknown words" due to cryptographic terms.

### Node.js API Usage

- **Start Node.js REPL**:
  ```bash
  npm run repl
  ```
  - Provides interactive CyberChef environment
  - Example usage: `bake("Hello World!", "To Base64")` returns `SGVsbG8gV29ybGQh`
  - Use `.exit` to quit

## Validation Requirements

### Manual Testing After Changes
**ALWAYS test functionality manually after making changes:**

1. **Web Application Testing**:
   - Start dev server: `npm start`
   - Navigate to http://localhost:8080
   - Test basic operation: drag "To Base64" to recipe area
   - Input text "Hello World!" 
   - Verify output shows "SGVsbG8gV29ybGQh"
   - Verify Auto Bake checkbox works
   - Check that Magic button appears (encoding detection)

2. **Node.js API Testing**:
   - Run: `npm run repl`
   - Test: `bake("Hello World!", "To Base64")`
   - Verify output: `SGVsbG8gV29ybGQh`

3. **Production Build Testing**:
   - Build: `npm run build`
   - Serve: `cd build/prod && python3 -m http.server 8081`
   - Test at http://localhost:8081 (same functionality as dev)

### Pre-commit Validation
Always run these commands before committing changes:
```bash
npm run lint          # NEVER CANCEL: ~30 seconds
npm test              # NEVER CANCEL: ~12 seconds, 1,933 tests
```

## Common Development Tasks

### Repository Structure
```
src/
├── core/           # Core CyberChef engine and operations
├── node/           # Node.js API wrapper
└── web/            # Web application UI

tests/
├── node/           # Node.js API tests  
├── operations/     # Operation functionality tests
└── browser/        # UI tests (require chromedriver)

build/
└── prod/           # Production build output
```

### Key Configuration Files
- `package.json`: Dependencies and npm scripts
- `Gruntfile.js`: Build task definitions
- `webpack.config.js`: Webpack bundling configuration
- `eslint.config.mjs`: Linting rules
- `.nvmrc`: Node.js version specification

### Adding New Operations
Use the built-in scaffolding:
```bash
npm run newop
```
Follow the interactive prompts to create operation boilerplate.

## Build System Details

### Technology Stack
- **Build System**: Grunt + Webpack
- **Frontend**: Vanilla JavaScript (no frameworks like jQuery by design)
- **Styling**: Bootstrap 4.6.2 + Material Design
- **Testing**: Custom test runner + Nightwatch (UI tests)
- **Linting**: ESLint + cspell

### Known Issues and Limitations

1. **chromedriver Installation**: May fail in restricted network environments
   - **Workaround**: Use `npm install --ignore-scripts` then `npm run postinstall`
   - **Impact**: UI tests won't work, but core functionality unaffected

2. **Grammar Linting**: Many false positives for cryptographic terms
   - **Expected**: cspell reports 7,000+ "unknown words" 
   - **Not a failure**: Technical terms like "GOST", "Vigenère", "XXTEA" are expected

3. **Deprecated Dependencies**: Some npm warnings about deprecated packages
   - **Expected**: Legacy crypto libraries have deprecated dependencies
   - **Not blocking**: Core functionality works correctly

### Docker Alternative
If local setup fails, use Docker:
```bash
docker build --tag cyberchef --ulimit nofile=10000 .
docker run -it -p 8080:80 cyberchef
```

## Timing Reference

| Command | Time | Timeout Needed |
|---------|------|----------------|
| `npm install` | ~10s | 300s |
| `npm start` | ~70s | 120s |
| `npm run build` | ~180s | 300s |
| `npm test` | ~12s | 60s |
| `npm run lint` | ~30s | 60s |
| `npm run node` | ~5s | 30s |

**Critical**: NEVER CANCEL builds or tests. Wait for completion even if they seem slow.