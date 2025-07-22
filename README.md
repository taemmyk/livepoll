# LivePoll
Attempted to revamp 9arm's vibepoll
- [ ] **Real-time polling** with automatic updates via Server-Sent Events
- [ ] **Admin panel** with Google OAuth authentication for secure access
- [ ] **Interactive voting interface** for participants
- [ ] **Dynamic results page** with animated visualization
- [ ] **Time limit options** including unlimited time polls
- [ ] **IP-based vote tracking** to prevent duplicate votes
- [ ] **Mobile-responsive design** for all devices

---

# VibePoll

VibePoll is a real-time interactive polling application that allows administrators to create polls and users to vote in them with live results visualization.

## Features

- **Real-time polling** with automatic updates via Server-Sent Events
- **Admin panel** with Google OAuth authentication for secure access
- **Interactive voting interface** for participants
- **Dynamic results page** with animated visualization
- **Time limit options** including unlimited time polls
- **IP-based vote tracking** to prevent duplicate votes
- **Mobile-responsive design** for all devices

## Live Demo

[VibePoll Live Demo](https://vibepoll.vercel.app)

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Google OAuth Setup](#google-oauth-setup)
- [Usage](#usage)
  - [Admin Access](#admin-access)
  - [Creating Polls](#creating-polls)
  - [Voting](#voting)
  - [Viewing Results](#viewing-results)
- [Architecture](#architecture)
- [Deployment](#deployment)
- [License](#license)

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/vibepoll.git
   cd vibepoll/app
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the app directory with the following:
   ```
   # NextAuth.js Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret-key

   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # Admin Emails (comma-separated list)
   ADMIN_EMAILS=your-email@gmail.com
   ```

4. Start the development server
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Configure the OAuth consent screen:
   - Select "External" user type
   - Add scopes for `email` and `profile`
   - Add your email as a test user
6. Create OAuth client ID:
   - Application type: Web application
   - Name: VibePoll
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
7. Copy the Client ID and Client Secret to your `.env.local` file

## Usage

### Admin Access

Navigate to `/admin` and sign in with your Google account (must be in the ADMIN_EMAILS list).

### Creating Polls

1. From the admin panel, create a new poll with:
   - Question title
   - Multiple answer options
   - Time limit (1 minute, 2 minutes, custom, or unlimited)
2. Start the poll when ready
3. View live results directly from the admin panel

### Voting

1. Navigate to `/vote` or share this URL with participants
2. Select an option and submit vote
3. Each IP address can only vote once per poll

### Viewing Results

1. Navigate to `/results` to see real-time poll results
2. Results update automatically without refreshing the page
3. Engaging animations show new votes as they arrive

## Architecture

- **Frontend**: Next.js 14 with App Router, React, and Tailwind CSS
- **Authentication**: NextAuth.js with Google provider
- **Real-time Updates**: Server-Sent Events (SSE)
- **State Management**: Singleton service pattern with in-memory storage
- **Styling**: TailwindCSS for responsive design

## Deployment

The application is optimized for deployment on Vercel:

1. Push your code to a GitHub repository
2. Connect your repository to Vercel
3. Configure the environment variables in Vercel dashboard
4. Deploy!

## License

This project is licensed under the MIT License - see the LICENSE file for details. 