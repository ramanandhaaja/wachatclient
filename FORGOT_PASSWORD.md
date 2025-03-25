# Forgot Password Feature

This document explains how the forgot password feature works in this application.

## Overview

The forgot password feature allows users to reset their password if they forget it. The flow is as follows:

1. User enters their email on the forgot password page
2. System sends a password reset link to the user's email (if the email exists in the system)
3. User clicks the link in the email
4. User is taken to a page where they can enter a new password
5. System updates the user's password

## Implementation Details

### Database Schema

The User model in the Prisma schema has been extended with the following fields:

- `resetToken`: A unique token used for password reset
- `resetTokenExpires`: A timestamp indicating when the reset token expires

### API Routes

The following API routes have been implemented:

- `/api/auth/forgot-password`: Handles the request to send a password reset email
- `/api/auth/verify-reset-token`: Verifies if a reset token is valid
- `/api/auth/reset-password`: Handles the request to reset a password

### Pages

The following pages have been implemented:

- `/auth/forgot-password`: Allows users to request a password reset
- `/auth/reset-password`: Allows users to reset their password using a token

## Setup

### Environment Variables

The following environment variables need to be set:

- `RESEND_API_KEY`: API key for Resend (email service)
- `EMAIL_FROM`: Email address to send emails from
- `NEXTAUTH_URL`: Base URL of the application

### Email Configuration

This application uses [Resend](https://resend.com) for sending emails. You need to:

1. Sign up for a Resend account
2. Get an API key
3. Set the `RESEND_API_KEY` environment variable

## Security Considerations

- Reset tokens expire after 1 hour
- For security reasons, the API doesn't reveal whether an email exists in the system
- Passwords are hashed using bcrypt before storing in the database
- Reset tokens are cleared after a successful password reset

## Testing

To test the forgot password feature:

1. Create a user account
2. Go to the sign-in page
3. Click on "Forgot password?"
4. Enter the email associated with your account
5. Check your email for the reset link
6. Click on the link and set a new password
7. Try signing in with the new password
