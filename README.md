# JurisMind CA - AI-Powered California Bar Exam Prep

An intelligent study companion for California Bar Exam preparation, powered by Google Gemini AI.

## Features

- **MBE Practice Tracker**: Log and track your MBE study sessions with detailed analytics
- **Pattern Recognition**: AI-powered analysis of MBE questions using OCR and multimodal capabilities
- **Essay Analysis**: Get feedback on practice essays based on official California model answers
- **Rule Database**: Extract and search legal rules from your uploaded model answers
- **Smart Scheduler**: Plan your study schedule leading up to exam day
- **Exam Analytics**: Visualize your performance across subjects and identify weak areas

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS
- **AI**: Google Generative AI (Gemini)
- **Charts**: Recharts
- **Icons**: Lucide React

## Run Locally

**Prerequisites:** Node.js 18+

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd JursMindBar
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env.local`:
     ```bash
     cp .env.example .env.local
     ```
   - Get your Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)
   - Add your API key to `.env.local`:
     ```
     VITE_GEMINI_API_KEY=your_api_key_here
     ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser** to `http://localhost:5173`

## Deploy to Vercel

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub** (if not already done)

2. **Visit [Vercel](https://vercel.com)** and sign in

3. **Import your repository**:
   - Click "Add New Project"
   - Select your GitHub repository
   - Click "Import"

4. **Configure environment variables**:
   - In the project settings, go to "Environment Variables"
   - Add: `VITE_GEMINI_API_KEY` with your Gemini API key
   - Click "Add"

5. **Deploy**:
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be live at `https://your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Add environment variables**
   ```bash
   vercel env add VITE_GEMINI_API_KEY
   ```
   Enter your Gemini API key when prompted.

5. **Deploy to production**
   ```bash
   vercel --prod
   ```

## Build for Production

To create a production build locally:

```bash
npm run build
```

The built files will be in the `dist/` directory.

To preview the production build:

```bash
npm run preview
```

## Important Security Notes

⚠️ **API Key Security**: This application uses the Gemini API key directly in the frontend. While this is acceptable for personal use or demos, be aware that:
- The API key is exposed in the browser
- Anyone with access to your deployed site can extract the key
- For production applications with multiple users, consider implementing a backend proxy to secure API calls

For production deployments:
1. Set spending limits on your Google Cloud account
2. Restrict API key usage by HTTP referrer in Google Cloud Console
3. Monitor your API usage regularly

## Project Structure

```
JursMindBar/
├── components/         # React components
│   └── Layout.tsx     # Main layout with navigation
├── pages/             # Page components
│   ├── Dashboard.tsx
│   ├── MBEPractice.tsx
│   ├── EssayAnalysis.tsx
│   ├── RuleDatabase.tsx
│   ├── Scheduler.tsx
│   └── ExamAnalytics.tsx
├── services/          # Business logic and API calls
│   ├── geminiService.ts    # Gemini AI integration
│   ├── knowledgeStore.ts   # Document management
│   └── mockData.ts         # Sample data
├── types.ts           # TypeScript type definitions
└── App.tsx            # Main app component
```

## Configuration Files

- `vite.config.ts` - Vite build configuration
- `tailwind.config.js` - TailwindCSS configuration
- `tsconfig.json` - TypeScript configuration
- `vercel.json` - Vercel deployment configuration
- `.env.local` - Local environment variables (not committed)
- `.env.example` - Example environment variables

## Contributing

This is a personal study tool, but contributions and suggestions are welcome!

## License

MIT

## Disclaimer

This tool is for educational purposes only. It does not guarantee success on the California Bar Exam. Always refer to official study materials and consult with bar prep professionals.
