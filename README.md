# Diamond Certificate Analyzer

A web application that helps users understand diamond certificates by providing easy-to-understand analysis of diamond specifications. The application supports both PDF certificate uploads and manual certificate number entry.

## Features

- PDF certificate upload and analysis
- Manual certificate number entry
- Detailed analysis of the 4Cs (Cut, Color, Clarity, and Carat)
- Plain language explanations of diamond characteristics
- Identification of notable features and potential concerns
- Suggested questions for jewelers

## Tech Stack

- Next.js 14 with App Router
- React with TypeScript
- Tailwind CSS for styling
- OpenAI GPT-4 for analysis
- Vercel AI SDK for streaming responses
- PDF parsing capabilities

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Development

The project uses the following main components:

- `CertificateUpload`: Handles PDF file uploads
- `CertificateNumberInput`: Manages manual certificate number entry
- `DiamondAnalysis`: Displays the analysis results

API routes:
- `/api/analyze-certificate`: Processes PDF certificate uploads
- `/api/analyze-certificate-number`: Handles certificate number analysis

## Future Enhancements

- Support for additional certification authorities
- Diamond comparison tool
- Price trend analysis
- Market value estimator
- Image recognition for certificates
- Server-side storage with Vercel KV or PostgreSQL

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 