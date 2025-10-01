# BrainRot ($ROT) Memecoin Website

Welcome to the official website for BrainRot ($ROT), the most brainrotted memecoin on Solana!

## Features

- **Phantom Wallet Integration**: Securely connect your Phantom wallet to participate in the presale
- **Presale with Bonuses**: 
  - Phase 1: 50% bonus (1 SOL = 1,500,000 ROT)
  - Phase 2: 30% bonus (1 SOL = 1,300,000 ROT)
  - Phase 3: 15% bonus (1 SOL = 1,150,000 ROT)
- **Social Verification**: Join our Telegram and follow us on X to participate
- **Referral Program**: Earn 1000 ROT tokens for each successful referral
- **Meme Gallery**: Browse our collection of brainrotted memes
- **Brainrot Game**: Coming soon - an epic gaming experience on Solana

## Technical Stack

- Next.js 15 with TypeScript
- Tailwind CSS v4 for styling
- Solana Web3.js for blockchain interactions
- Phantom Wallet integration

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Development Fixes

### Tailwind CSS Linting Issue Resolution

Fixed the "Unknown at rule @tailwind css(unknownAtRules)" error by implementing multiple layers of fixes:

1. **Added comprehensive stylelint configuration** (`.stylelintrc.json`):
   - Configured rules to ignore Tailwind CSS at-rules (`@tailwind`, `@apply`, etc.)
   - Extended standard stylelint configuration
   - Added proper ignore patterns

2. **Enhanced editor configuration** (`.vscode/settings.json`):
   - Disabled default CSS validation in favor of stylelint
   - Configured file associations for Tailwind CSS recognition
   - Enabled proper validation for CSS files

3. **Added editor extension recommendations** (`.vscode/extensions.json`):
   - Recommended Tailwind CSS IntelliSense extension
   - Recommended Stylelint extension

4. **Improved global CSS file structure**:
   - Added detailed comments explaining Tailwind directives
   - Better organized CSS custom properties
   - Enhanced accessibility features

5. **Added stylelint ignore file** (`.stylelintignore`):
   - Configured patterns to exclude build artifacts
   - Prevented linting of generated files

These changes ensure that editors properly recognize Tailwind directives without showing linting errors while maintaining proper CSS linting for custom styles.

## Deployment

To build for production:
```bash
npm run build
```

To start the production server:
```bash
npm start
```

## Environment Variables

No environment variables are required for this project.

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [Solana Documentation](https://docs.solana.com/)
- [Phantom Wallet Documentation](https://docs.phantom.app/)

## Contributing

This is a private project for the BrainRot memecoin team.

## License

This project is proprietary and confidential.