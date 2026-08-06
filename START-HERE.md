# Start Here — Clean Project

This folder is a completely separate Vault Rush project. **Do not extract it into or over the old `safe-cracker-game` folder.**

## Safest Windows setup

You may double-click `SETUP-AND-RUN.bat`, or use the commands below. The launcher installs dependencies, runs every check, and starts Vite only when the checks pass.

1. Extract the ZIP to your Desktop.
2. Confirm that Windows created this new folder:

   ```text
   C:\Users\User\Desktop\vault-rush-code-breakers-balanced
   ```

3. Open PowerShell and run:

   ```powershell
   cd "$HOME\Desktop\vault-rush-code-breakers-balanced"
   code .
   npm install
   npm run check
   npm run dev
   ```

4. Open the local address printed by Vite, normally:

   ```text
   http://localhost:5173/
   ```

Your old repository is not needed for these steps and should remain untouched.

## Create a brand-new Git repository

After `npm run check` passes:

```powershell
git init
git add .
git commit -m "feat: build Vault Rush Beat the Lockdown"
git branch -M main
```

Create a new empty GitHub repository, then connect it using the repository URL GitHub gives you:

```powershell
git remote add origin https://github.com/YOUR-USERNAME/YOUR-NEW-REPOSITORY.git
git push -u origin main
```

## Useful commands

```powershell
npm run dev       # Start development server
npm run lint      # Check code quality
npm test          # Run gameplay-rule tests
npm run build     # Create production build
npm run check     # Lint + tests + production build
npm run preview   # Preview the production build
```
