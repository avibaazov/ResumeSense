# 📄 ResumeSense
<a href="https://resume-sense.vercel.app/" target="_blank">
<img width="1875" height="485" alt="image" src="https://github.com/user-attachments/assets/0fd8053f-7cd4-4d61-93fb-db8485b37667" />
</a>
**AI-Powered Resume Analysis & Optimization Platform**

ResumeSense is a modern web application that helps job seekers optimize their resumes using advanced AI analysis. Upload your resume, get detailed feedback, and improve your chances of landing your dream job.

## ✨ Features

- **🤖 AI-Powered Analysis** - Get comprehensive feedback on your resume using Google Gemini AI
- **📊 Smart Scoring** - Receive detailed scores for different aspects of your resume
- **📱 Responsive Design** - Works seamlessly on desktop and mobile devices
- **🔒 Secure Authentication** - User authentication powered by Supabase
- **💾 Cloud Storage** - Secure resume storage and management
- **📈 Progress Tracking** - Track your resume improvements over time
- **🎨 Modern UI** - Clean, intuitive interface with smooth animations

## 🛠️ Tech Stack

- **Frontend:** React 19, React Router v7, TypeScript
- **Styling:** Tailwind CSS, Custom animations
- **Backend:** Supabase (Authentication, Database, Storage)
- **AI Integration:** Google Gemini AI, Anthropic Claude
- **PDF Processing:** PDF.js
- **State Management:** Zustand
- **Deployment:** Vercel/Netlify ready

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Google AI API key
- Anthropic API key (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/avibaazov/ResumeSense.git
   cd ResumeSense
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GOOGLE_GEMINI_API_KEY=your_google_ai_api_key
   VITE_ANTHROPIC_API_KEY=your_anthropic_api_key
   ```

4. **Set up Supabase Database**
   
   Run the SQL schema in your Supabase project:
   ```bash
   # Use the supabase-schema.sql file in your Supabase SQL editor
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
ResumeSense/
├── app/
│   ├── components/          # Reusable UI components
│   │   ├── Navbar.tsx
│   │   ├── ResumeCard.tsx
│   │   └── ScoreCircle.tsx
│   ├── lib/                 # Core utilities and services
│   │   ├── auth.ts         # Authentication logic
│   │   ├── database.ts     # Database operations
│   │   ├── aiService.ts    # AI integration
│   │   ├── resumeStore.ts  # Resume management
│   │   ├── supabase.ts     # Supabase client
│   │   └── storage.ts      # File storage
│   ├── routes/             # Application pages
│   │   ├── auth.tsx        # Authentication page
│   │   ├── home.tsx        # Dashboard
│   │   ├── resume.tsx      # Resume details
│   │   └── upload.tsx      # Resume upload
│   └── app.css            # Global styles
├── public/                 # Static assets
├── types/                  # TypeScript type definitions
├── constants/              # App constants
├── vercel.json            # Vercel deployment config
├── netlify.toml           # Netlify deployment config
└── supabase-schema.sql    # Database schema
```

## 🎯 Usage

1. **Sign Up/Login** - Create an account or sign in
2. **Upload Resume** - Upload your PDF resume
3. **Get AI Analysis** - Receive detailed feedback and scoring
4. **Review Results** - View comprehensive analysis with improvement suggestions
5. **Track Progress** - Upload updated versions and track improvements

## 🔧 Configuration

### Supabase Setup

1. Create a new Supabase project
2. Run the provided SQL schema (`supabase-schema.sql`)
3. Enable Row Level Security (RLS) for all tables
4. Configure storage buckets for resume files

### AI Service Configuration

The app supports multiple AI providers:
- **Google Gemini** - Primary AI service for resume analysis
- **Anthropic Claude** - Alternative AI service

## 🚀 Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch





