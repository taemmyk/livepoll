# VibePoll

A real-time interactive polling platform built with Next.js.

## Authentication Setup

VibePoll now uses Google OAuth for admin authentication. Follow these steps to set it up:

### 1. Create a Google OAuth Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Configure the OAuth consent screen:
   - Select "External" user type
   - Enter app information (name, logo, etc.)
   - Add scopes for `email` and `profile`
   - Add your email as a test user
6. Create OAuth client ID:
   - Application type: Web application
   - Name: VibePoll
   - Authorized JavaScript origins: `http://localhost:3000` (add your production URL too)
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google` (add your production URL too)
7. Note the generated Client ID and Client Secret

### 2. Configure Environment Variables

Create or update `.env.local` file in the project root with the following variables:

```
# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-replace-this-with-actual-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret 

# Admin Emails (comma-separated list of emails that are allowed to access admin panel)
ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

For production, make sure to:
- Generate a strong random string for `NEXTAUTH_SECRET`
- Update `NEXTAUTH_URL` to your production URL
- Add authorized admin emails to `ADMIN_EMAILS`

### 3. Run the Application

```bash
npm install
npm run dev
```

Visit http://localhost:3000/admin to access the admin panel. Only users with emails listed in `ADMIN_EMAILS` will be granted access.

## Features

- Real-time polling with automatic updates
- Admin panel for creating and managing polls
- Interactive voting interface
- Dynamic results page with charts
- IP-based vote tracking to prevent duplicate votes
- No database required - runs entirely in memory
- Mobile-responsive design

## Getting Started

### Prerequisites

- Node.js 18.17 or later

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd vibepoll
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Admin Access

- Navigate to `/admin`
- Login with the default credentials:
  - Username: `admin`
  - Password: `password`
- Create a new poll with a question and multiple options
- Set the poll duration (1 minute, 2 minutes, or custom)
- Start the poll when ready
- End the poll manually if needed

### Voting

- Navigate to `/vote` to participate in the current active poll
- Select an option and submit your vote
- Each IP address can only vote once per poll

### Viewing Results

- Navigate to `/results` to see real-time poll results
- Results are displayed as a bar chart and in a detailed table
- Results update in real-time as votes come in

## Deployment on Vercel

This application is optimized for deployment on Vercel.

1. Create a Vercel account at [vercel.com](https://vercel.com)
2. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```
3. Deploy:
   ```bash
   vercel
   ```

## Architecture

- Built with Next.js 14 App Router
- Uses Server-Sent Events (SSE) for real-time updates
- Stores poll data in memory using a singleton service pattern
- Chart visualization using Chart.js and react-chartjs-2
- Styling with Tailwind CSS

## Security Considerations

- The admin API is protected with a simple API key
- In a production environment, you should:
  - Set the API key as an environment variable
  - Implement proper authentication (OAuth, JWT, etc.)
  - Consider rate limiting for the voting endpoint

## License

This project is open source and available under the [MIT License](LICENSE).
