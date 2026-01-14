## Setting up Google Drive uploads (client)

1. Go to Google Cloud Console > APIs & Services > Credentials.
2. Create an OAuth 2.0 Client ID for Web application.
   - Add your site's origin to the Authorized JavaScript origins (e.g., https://your-domain.com).
   - Add redirect URIs if you intend to use a full OAuth flow; for Identity Services token client you only need the origin.
3. Enable the Drive API for your project.
4. Copy the Client ID and set it in your frontend as `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.

Notes:
- This project uses Google Identity Services token client to request an access token with `drive.file` scope.
- For large files, the current implementation collects the file in memory before uploading as a multipart request. For production, implement resumable uploads (https://developers.google.com/drive/api/guides/manage-uploads).
- Ensure your OAuth consent screen is configured properly when requesting access from end users.

Deployment:
- Set `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in your frontend hosting environment (e.g., Vercel Environment Variables) so the client can request Drive access tokens at runtime.
