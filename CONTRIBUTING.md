# Contributing to Oit ⚡

Thank you for your interest in contributing to **Oit**! We welcome community contributions to help improve this real-time communication platform.

## Code of Conduct

Please treat everyone with respect, kindness, and professionalism. We are committed to providing a friendly and inclusive experience for all contributors.

## How Can I Contribute?

### 1. Reporting Bugs
- Check existing [GitHub Issues](https://github.com/felixpalingan/Oit/issues) before opening a new issue to avoid duplicates.
- Provide a clear and descriptive title.
- Describe the steps to reproduce the issue, expected vs actual behavior, and attach screenshots or console logs if relevant.

### 2. Suggesting Features
- Open a GitHub issue with the `[Feature Request]` tag.
- Clearly describe the feature, the problem it solves, and how it aligns with the Oit vision.

### 3. Submitting Pull Requests
1. **Fork** the repository and clone your fork locally:
   ```bash
   git clone https://github.com/<your-username>/Oit.git
   cd Oit
   ```
2. **Create a branch** for your feature or bugfix:
   ```bash
   git checkout -b feat/your-feature-name
   # or
   git checkout -b fix/your-bugfix-name
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Follow code style & architecture conventions**:
   - Use Next.js 16 App Router conventions (e.g. `src/proxy.ts` instead of `middleware.ts`).
   - Write type-safe TypeScript code without arbitrary `any` where possible.
   - Maintain the iconic High-Voltage dark glassmorphic design system tokens.
   - Ensure all user-facing text is written in English.
5. **Verify the production build**:
   ```bash
   npm run build
   ```
   Ensure the build completes with zero errors and zero warnings.
6. **Commit with Conventional Commits**:
   - `feat(...)`: New features
   - `fix(...)`: Bug fixes
   - `refactor(...)`: Code refactoring without behavioral changes
   - `docs(...)`: Documentation changes
   - `chore(...)`: Maintenance and dependency upgrades
7. **Push to your fork** and open a Pull Request against the `main` branch.

## Database & RLS Contributions
- Any database modifications must include corresponding PostgreSQL migration scripts inside the `supabase/` directory.
- Always enforce strict Row-Level Security (RLS) policies based on `auth.uid()` and server role hierarchies.

Thank you for making Oit better! 🚀
