# Indiasetz Task

A React + TypeScript + Vite application for uploading files to AWS S3 with drag-and-drop support, upload progress tracking, and toast notifications.

## Features

- File upload field with support for multiple files
- AWS S3 upload using `@aws-sdk/lib-storage`
- Drag-and-drop support and standard file picker
- Upload progress tracking and cancellation
- Form handling using `react-hook-form`
- Bootstrap styling and `react-toastify` notifications

## Project Structure

- `src/App.tsx` — main application component and form wrapper
- `src/components/UploadField.tsx` — reusable file upload component
- `src/components/Buttons.tsx` — button component
- `src/AWS/aws.ts` — AWS S3 client configuration
- `src/Hooks/useToast.tsx` — custom toast hook
- `src/Types/UploadFieldTypes.ts` — shared TypeScript types
- `src/utilities/FileIconRules.ts` — file icon helper rules

## Prerequisites

- Node.js 18+ recommended
- npm installed
- AWS S3 bucket and IAM credentials with upload permissions

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root and add the AWS variables:

```env
VITE_AWS_REGION=your-aws-region
VITE_AWS_BUCKET_NAME=your-s3-bucket-name
VITE_AWS_ACCESS_KEY_ID=your-access-key-id
VITE_AWS_SECRET_ACCESS_KEY=your-secret-access-key
```

3. Start the development server:

```bash
npm run dev
```

4. Open the app in your browser at the URL shown in the terminal (usually `http://localhost:5173`).

## Available Scripts

- `npm run dev` — start Vite dev server
- `npm run build` — build the app for production
- `npm run lint` — run ESLint checks
- `npm run preview` — locally preview the production build

## Environment Variables

The application requires the following Vite environment variables:

- `VITE_AWS_REGION` — AWS region for the S3 bucket
- `VITE_AWS_BUCKET_NAME` — S3 bucket name
- `VITE_AWS_ACCESS_KEY_ID` — AWS access key ID
- `VITE_AWS_SECRET_ACCESS_KEY` — AWS secret access key

## Notes

- The uploaded file URL is built using the configured S3 bucket and region.
- Ensure your AWS credentials are valid and the IAM user has permission to upload to the specified bucket.
- For production, do not commit credentials to version control. Use a secure secrets manager or environment configuration.

## License

This repository is provided as-is.
