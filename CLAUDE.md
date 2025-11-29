# CLAUDE.md - AI Assistant Guide for JurisMind CA

## Project Overview

**JurisMind CA** is an AI-powered California Bar Exam preparation platform that helps law students prepare for the California Bar Exam using Google Gemini AI. The application features MBE practice tracking, essay analysis against official model answers, rule extraction, smart scheduling, and exam analytics.

**Key Philosophy**: This application uses a "closed-loop" AI approach where the AI analyzes student work strictly against uploaded official California Bar model answers, avoiding hallucination of legal rules.

## Tech Stack

- **Frontend Framework**: React 18.2 + TypeScript 5.4
- **Build Tool**: Vite 5.1.6
- **Styling**: TailwindCSS (via CDN - see index.html:7)
- **AI Integration**: Google Generative AI (@google/generative-ai) with Gemini 2.0 Flash Exp
- **Charts**: Recharts 2.12
- **Icons**: Lucide React 0.344
- **Deployment**: Vercel (configured via vercel.json)
- **Module Type**: ES Modules (type: "module" in package.json:5)

## Project Structure

```
JursMindBar/
├── components/
│   └── Layout.tsx              # Main layout with sidebar navigation and mobile menu
├── pages/                      # Page components (state-based routing)
│   ├── Dashboard.tsx           # Main dashboard overview
│   ├── MBEPractice.tsx         # MBE question logging and analysis
│   ├── EssayAnalysis.tsx       # Essay grading against model answers
│   ├── RuleDatabase.tsx        # Rule extraction and search
│   ├── Scheduler.tsx           # Study schedule planning
│   └── ExamAnalytics.tsx       # Performance visualization
├── services/                   # Business logic and integrations
│   ├── geminiService.ts        # Gemini AI API calls with structured output
│   ├── knowledgeStore.ts       # In-memory knowledge base management
│   └── mockData.ts             # Sample/seed data
├── types.ts                    # TypeScript type definitions (central)
├── App.tsx                     # Root component with state-based router
├── index.tsx                   # React DOM entry point
├── index.html                  # HTML entry with Tailwind CDN + import maps
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript configuration
├── vercel.json                 # Vercel SPA routing config
├── .env.example                # Environment variable template
├── package.json                # Dependencies and scripts
└── metadata.json               # Application metadata
```

## Architecture & Key Patterns

### 1. Routing Strategy
- **No router library** - Uses simple state-based routing in App.tsx:13
- `activePage` state determines which page component renders
- Navigation handled via `setActivePage` callback passed to Layout
- Benefits: Lightweight, no additional dependencies

### 2. State Management
- **No global state library** - Uses React local state and prop drilling
- `knowledgeStore.ts` implements a simple singleton store with subscription pattern
- Store listeners trigger re-renders when knowledge base is updated (knowledgeStore.ts:146-155)

### 3. Styling Approach
- **Tailwind via CDN** (index.html:7) - NOT installed as npm dependency
- Utility-first CSS classes directly in JSX
- Custom font: Inter from Google Fonts (index.html:8)
- Color scheme: Slate grays with blue accents

### 4. AI Integration Pattern

The Gemini service follows a strict "closed-loop" approach:

```typescript
// System instruction prevents hallucination (geminiService.ts:10-19)
const CA_BAR_SYSTEM_INSTRUCTION = `
  You are a specialized Data Extraction and Analysis Engine for the California Bar Exam.
  CRITICAL PROTOCOL:
  1. You have NO independent knowledge of the law.
  2. You can ONLY answer based on the "Context Documents" provided.
  3. If a rule is NOT found in the Context Documents, state "Not found in uploaded materials".
  4. Do NOT hallucinate. Do NOT use outside training data.
`;
```

**Key Functions** (all in geminiService.ts):
- `analyzeEssayClosedLoop()` - Grade essays against uploaded model answers
- `extractRuleFromContext()` - Extract rule definitions from knowledge base
- `identifyPatternsInKnowledgeBase()` - Find recurring patterns in essays
- `analyzeSubjectSubtopics()` - Analyze subtopic frequency
- `analyzeMBEQuestionMultimodal()` - OCR + pattern recognition for MBE questions

All functions use **structured JSON output** via Gemini's `responseSchema` feature.

### 5. Knowledge Base Management

`knowledgeStore.ts` implements a reactive store:
- **Initial seed data**: 4 California Bar model answers (knowledgeStore.ts:5-104)
- **Subscribe/notify pattern**: Components can listen for changes
- **Context compilation**: `getFullContextText()` concatenates selected documents for AI context
- Documents can be filtered by `Subject` enum

## TypeScript Configuration

Key settings from tsconfig.json:
- **Target**: ES2020
- **Module**: ESNext with bundler resolution
- **Strict mode**: Enabled
- **Unused variables/parameters**: NOT enforced (noUnusedLocals: false, noUnusedParameters: false)
- **JSX**: react-jsx (new JSX transform)

## Environment Variables

Required environment variable:
- `VITE_GEMINI_API_KEY` - Google Gemini API key (see .env.example)

Access pattern: `import.meta.env.VITE_GEMINI_API_KEY` (geminiService.ts:7)

**Security Note**: API key is exposed client-side. README.md warns users to set spending limits and restrict by HTTP referrer.

## Development Workflow

### Available Scripts
```bash
npm run dev      # Start Vite dev server (default: http://localhost:5173)
npm run build    # Production build to dist/
npm run preview  # Preview production build locally
```

### Development Server
- Runs on Vite's default port 5173
- Hot module replacement (HMR) enabled
- Environment variables loaded from .env.local

### Build Process
- TypeScript compilation via Vite
- Output to `dist/` directory
- Single-page application (SPA) build
- Optimized bundle with tree-shaking

## Deployment

### Vercel Configuration
- `vercel.json` configures SPA routing (all routes → /index.html)
- Environment variable `VITE_GEMINI_API_KEY` must be set in Vercel dashboard
- No server-side code - fully static deployment

### Git Workflow
- Current branch: `claude/claude-md-mikum32kjes239k8-01TvkvwVobWH4arMrVq3iby8`
- Clean working directory at session start
- Recent commits show Vercel deployment prep and dependency updates

## Key Conventions for AI Assistants

### 1. Type Safety
- **Always use the Subject enum** from types.ts (lines 3-16) - never hardcode subject strings
- All data models are defined in `types.ts` - import from there, don't redefine
- Component props should have explicit interfaces

### 2. File Organization
- **Pages go in /pages** - One file per route
- **Reusable components in /components** - Currently only Layout.tsx
- **Business logic in /services** - Keep components presentational
- **Types in /types.ts** - Single source of truth for type definitions

### 3. Styling Patterns
- Use Tailwind utility classes (CDN version - no custom config)
- Color scheme: `slate-*` for grays, `blue-*` for primary actions
- Responsive: `md:` prefix for desktop breakpoint
- Font: Inter (already loaded globally)

### 4. AI Service Integration
When adding new AI features:
1. Define response schema using Gemini's SchemaType
2. Include `CA_BAR_SYSTEM_INSTRUCTION` or similar to prevent hallucination
3. Use `responseMimeType: "application/json"` for structured output
4. Pass knowledge base context via `knowledgeStore.getFullContextText(subject?)`
5. Parse response with `JSON.parse(response.response.text())`

Example pattern:
```typescript
const modelInstance = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
  systemInstruction: CA_BAR_SYSTEM_INSTRUCTION,
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: { /* schema definition */ }
  }
});
```

### 5. State Updates
- For knowledge base changes, use `knowledgeStore` methods
- For page navigation, update `activePage` state in App.tsx
- For local component state, use `useState` hook
- Subscribe to knowledge store if component needs to react to document changes

### 6. Code Style
- Use arrow functions for components: `export const ComponentName: React.FC<Props> = ({ props }) => { ... }`
- Prefer named exports over default exports (except App.tsx)
- Use optional chaining (`?.`) for potentially undefined values
- Template literals for multi-line strings

### 7. Testing & Validation
- No testing framework currently installed
- Manual testing via dev server
- Verify AI responses match expected schema before parsing
- Test with different subjects using the Subject enum

### 8. Don't Over-Engineer
- Keep it simple - no state management libraries, no router, no complex abstractions
- Favor readability over premature optimization
- Use in-memory storage (no database)
- Client-side only logic

## California Bar Exam Domain Knowledge

This application is specialized for California Bar Exam preparation. Key subjects:

**MBE Subjects** (Multi-state):
- Torts, Contracts, Criminal Law, Property, Constitutional Law, Evidence, Civil Procedure

**California-Specific Subjects**:
- Professional Responsibility, Community Property, Wills & Trusts, Business Associations, Remedies

**Important California Distinctions**:
- Proposition 8 (Evidence Code)
- CEC 1240 (California Evidence Code)
- Community Property rules specific to California

When implementing features, respect that:
1. Model answers are the **source of truth** for legal rules
2. AI should NOT generate legal rules from training data
3. California has unique rules that differ from general law
4. Students are graded on issue-spotting, rule statements, application, and conclusion (IRAC method)

## Common Tasks for AI Assistants

### Adding a New Page
1. Create page component in `/pages/NewPage.tsx`
2. Add route case to `renderPage()` switch in App.tsx:15-25
3. Add navigation item to `navItems` in Layout.tsx:14-21
4. Import Lucide icon if needed
5. Match existing styling patterns (bg-slate-50, rounded cards, etc.)

### Adding a New AI Feature
1. Add function to `geminiService.ts`
2. Define response interface in `types.ts`
3. Create responseSchema with SchemaType
4. Include CA_BAR_SYSTEM_INSTRUCTION or custom instruction
5. Use `knowledgeStore.getFullContextText()` for context
6. Handle errors gracefully (try/catch with user-friendly messages)

### Modifying Knowledge Store
1. Update store methods in `knowledgeStore.ts`
2. Update `KnowledgeDocument` interface if schema changes
3. Ensure subscribers are notified via `this.notify()`
4. Update INITIAL_DOCS if adding seed data

### Adding Dependencies
1. Install via npm: `npm install package-name`
2. Update imports to use new package
3. Check if Vite config needs updates (rare)
4. Verify TypeScript types are available or install @types/package-name

### Updating Styles
1. Use Tailwind classes (no custom CSS files needed)
2. Match existing color scheme (slate + blue)
3. Test responsive behavior (mobile menu in Layout.tsx)
4. Maintain accessibility (aria labels, keyboard navigation)

## Important Files to Read Before Making Changes

- `types.ts` - Understand all data models
- `geminiService.ts` - Understand AI integration patterns
- `knowledgeStore.ts` - Understand data flow
- `Layout.tsx` - Understand navigation structure
- `App.tsx` - Understand routing mechanism

## Gotchas & Common Mistakes

1. **Tailwind is CDN-based**: Don't try to configure tailwind.config.js - it won't work
2. **No router library**: Don't import react-router-dom - use state-based routing
3. **Environment variables**: Must use `VITE_` prefix and access via `import.meta.env`
4. **Subject enum**: Use `Subject.TORTS` not string "Torts"
5. **Gemini API responses**: Always parse as JSON when using structured output
6. **Knowledge store is singleton**: Import the instance, not the class
7. **TypeScript strict mode**: Handle null/undefined cases explicitly

## Performance Considerations

- **Knowledge base size**: Context concatenation in `getFullContextText()` can grow large
- **AI API calls**: Rate limits apply - implement loading states
- **No server-side rendering**: All rendering happens client-side
- **Bundle size**: Monitor dist/ size - currently lightweight without router/state libraries

## Security Notes

From README.md:122-132:
- API key is **exposed client-side**
- Suitable for personal use or demos only
- For production: implement backend proxy, set spending limits, restrict by HTTP referrer
- No user authentication or backend currently

## Future Enhancement Considerations

When extending this application:
- Consider adding persistence (localStorage or backend)
- Consider adding user authentication for multi-user deployments
- Consider rate limiting AI API calls
- Consider adding a backend proxy to secure API key
- Consider adding automated testing (Vitest recommended for Vite projects)
- Consider adding analytics to track feature usage

## Resources

- [Gemini API Docs](https://ai.google.dev/docs)
- [Vite Documentation](https://vitejs.dev)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app)
- [Tailwind CSS](https://tailwindcss.com)

## Questions to Ask Before Making Changes

1. Does this change affect the AI's ability to stay "closed-loop"?
2. Will this work with the CDN version of Tailwind?
3. Should this be a new page or a component within an existing page?
4. Does this need to persist across sessions? (Currently no persistence)
5. Will this impact bundle size significantly?
6. Does this need a new type definition in types.ts?
7. Should this trigger knowledge store updates?

---

**Last Updated**: 2025-11-29
**Codebase Version**: v0.0.0
**Primary Contact**: See repository owner

This document should be updated whenever major architectural changes are made to the codebase.
