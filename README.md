# 🏛️ CivicTrack - Community Issue Reporting Platform

A modern, full-stack civic engagement platform that empowers citizens to report and track community issues in real-time. Built with React, TypeScript, Supabase, and modern web technologies.

![CivicTrack Platform](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-2.53.0-green)

## ✨ Features

### 🎯 **For Citizens**

- **Report Issues**: Submit community problems with photos, location, and detailed descriptions
- **Interactive Map**: View all reported issues on an interactive map with color-coded markers
- **Real-time Updates**: Get live notifications when your issues are updated
- **Personal Dashboard**: Track your submitted reports and their progress
- **Community Engagement**: Upvote important issues and flag inappropriate content
- **Anonymous Reporting**: Option to report issues anonymously for sensitive matters

### 👨‍💼 **For Administrators**

- **Admin Dashboard**: Comprehensive overview of all platform activity
- **Issue Management**: Update issue status (Reported → In Progress → Resolved)
- **Content Moderation**: Delete inappropriate or spam issues
- **Analytics**: Real-time statistics and platform insights
- **User Management**: Monitor user activity and reports

### 🛠️ **Technical Features**

- **Real-time Sync**: Live updates using Supabase real-time subscriptions
- **Secure Authentication**: Protected routes with role-based access control
- **Image Storage**: Secure file uploads to Supabase storage
- **Mobile Optimized**: Responsive design that works on all devices
- **Interactive Maps**: Leaflet.js integration for location-based features
- **AI Chat Support**: Integrated chatbot for user assistance

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/swoosh-world.git
   cd swoosh-world
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Add your Supabase credentials:

   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase Database**

   Run the following SQL in your Supabase SQL editor:

   ```sql
   -- Issues table
   CREATE TABLE issues (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     title VARCHAR(60) NOT NULL,
     description TEXT NOT NULL,
     category VARCHAR(50) NOT NULL,
     status VARCHAR(20) DEFAULT 'reported',
     coordinates JSONB NOT NULL,
     images TEXT[] DEFAULT '{}',
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW(),
     reported_by UUID REFERENCES auth.users(id),
     is_anonymous BOOLEAN DEFAULT FALSE,
     upvotes INTEGER DEFAULT 0,
     flagged BOOLEAN DEFAULT FALSE
   );

   -- Enable Row Level Security
   ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

   -- Policies for authenticated users
   CREATE POLICY "Users can view all issues" ON issues
     FOR SELECT USING (auth.role() = 'authenticated');

   CREATE POLICY "Users can insert their own issues" ON issues
     FOR INSERT WITH CHECK (auth.uid() = reported_by);

   CREATE POLICY "Users can update their own issues" ON issues
     FOR UPDATE USING (auth.uid() = reported_by);
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 🏗️ Project Structure

```
swoosh-world/
├── client/                 # React frontend application
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # Shadcn/ui components
│   │   ├── Layout.tsx     # Main layout component
│   │   ├── MapView.tsx    # Interactive map component
│   │   └── ChatBot.tsx    # AI chat support
│   ├── pages/             # Application pages
│   │   ├── Dashboard.tsx  # User dashboard
│   │   ├── ReportIssue.tsx # Issue reporting form
│   │   ├── Admin.tsx      # Admin panel
│   │   └── ...
│   ├── contexts/          # React contexts
│   │   ├── AuthContext.tsx # Authentication state
│   │   └── AdminContext.tsx # Admin permissions
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility libraries
│   └── utils/             # Helper functions
├── server/                # Express.js backend
├── netlify/               # Netlify functions
└── shared/                # Shared utilities
```

## 🔧 Configuration

### Admin Access

To set up admin access, update the admin email in `client/contexts/AdminContext.tsx`:

```typescript
const ADMIN_EMAIL = "admin@civictrack.com"; // Change this to your admin email
```

### ChatBot Integration

To connect your chatbot API, update the ChatBot component in `client/components/Layout.tsx`:

```typescript
<ChatBot apiUrl="https://your-api-endpoint.com/chat" />
```

## 🎨 Customization

### Styling

The project uses Tailwind CSS with a custom design system. Key colors:

- **Primary**: Deep Sky Blue (#2B6CB0)
- **Secondary**: Teal (#38B2AC)
- **Background**: Light gray with glass effects

### Categories

Update issue categories in `client/constants/categories.ts`:

```typescript
export const ISSUE_CATEGORIES = [
  { value: "infrastructure", label: "Infrastructure" },
  { value: "safety", label: "Safety & Security" },
  // Add your categories here
];
```

## 📱 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run build:client     # Build client only
npm run build:server     # Build server only

# Testing & Quality
npm run test             # Run tests
npm run typecheck        # TypeScript type checking
npm run format.fix       # Format code with Prettier

# Production
npm run start            # Start production server
```

## 🔐 Security Features

- **Row Level Security**: Database policies ensure data isolation
- **Protected Routes**: Authentication required for sensitive pages
- **Role-Based Access**: Admin functions restricted to authorized users
- **Input Validation**: Zod schema validation for all forms
- **Secure File Uploads**: Images stored securely in Supabase storage

## 🌐 Deployment

### Netlify (Recommended)

1. Connect your GitHub repository to Netlify
2. Set environment variables in Netlify dashboard
3. Deploy automatically on push to main branch

### Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in project root
3. Follow the prompts

### Manual Deployment

```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the [IMPROVEMENTS_SUMMARY.md](IMPROVEMENTS_SUMMARY.md) for detailed feature overview
- **Issues**: Report bugs or request features via GitHub Issues
- **Chat Support**: Use the in-app chatbot for immediate assistance

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/) and [TypeScript](https://www.typescriptlang.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/) and [Shadcn/ui](https://ui.shadcn.com/)
- Backend powered by [Supabase](https://supabase.com/)
- Maps by [Leaflet](https://leafletjs.com/)
- Icons from [Lucide React](https://lucide.dev/)

---

**Made with ❤️ for better communities everywhere**
