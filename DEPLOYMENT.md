# GitHub Pages Deployment

## Before deployment

```bash
npm install
npm run check
```

Then complete one victory run and one loss run locally.

## Create a new repository

This project is intentionally independent of the old repository.

```bash
git init
git add .
git commit -m "feat: build Vault Rush Beat the Lockdown"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-NEW-REPOSITORY.git
git push -u origin main
```

## Enable Pages

1. Open the new GitHub repository.
2. Open **Settings → Pages**.
3. Set the source to **GitHub Actions**.
4. Open the **Actions** tab.
5. Confirm `Test and deploy Vault Rush` passes.
6. Open the Pages URL from the deployment summary.

## Public-link smoke test

- [ ] Start screen loads in a private browser window.
- [ ] Browser console contains no red errors.
- [ ] Start Game begins Stage 1.
- [ ] All three stages work.
- [ ] Power Outage rearranges every Stage 3 key.
- [ ] Victory and loss both work.
- [ ] Play Again resets the run.
- [ ] Sound toggle works after user interaction.
- [ ] Mobile layout works from the public URL.
