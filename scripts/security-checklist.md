# Security Checklist for API Key Exposure

This document provides steps to address the exposure of your Google API key and prevent similar issues in the future.

## Immediate Actions

### 1. Regenerate the Compromised API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Credentials"
3. Find the compromised API key (`AIzaSyATHLDeMHQN530DBX9S8BlxGZqi2Pl5L3U`)
4. Click on the key to edit it
5. Click the "Regenerate Key" button
6. Copy the new key and update your `.env.local` file with the new value

### 2. Add API Key Restrictions

While in the Google Cloud Console editing your API key:

1. Under "Application restrictions", consider limiting to specific websites or IP addresses
2. Under "API restrictions", limit the key to only the specific APIs your application needs
3. Save your changes

### 3. Update Environment Variables

1. Ensure your `.env.local` file contains the new API key
2. Verify that no hardcoded credentials exist in your codebase
3. Deploy your application with the updated environment variables

## Preventive Measures

### 1. Regular Code Reviews

- Implement pre-commit hooks to scan for potential credential leaks
- Consider using tools like [GitGuardian](https://www.gitguardian.com/) or [Spectral](https://spectralops.io/) to detect secrets in code

### 2. Education and Best Practices

- Ensure all team members understand the importance of keeping credentials secure
- Document security best practices in your project README
- Use environment variables for all sensitive information

### 3. Monitoring

- Set up alerts for unusual API usage patterns
- Regularly review your Google Cloud Console for any security notifications
- Consider implementing API usage quotas to limit potential abuse

## Additional Resources

- [Google Cloud: Best practices for securing API keys](https://cloud.google.com/docs/authentication/api-keys#securing_an_api_key)
- [OWASP: API Security Top 10](https://owasp.org/www-project-api-security/)
- [GitHub: Removing sensitive data from a repository](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository) 