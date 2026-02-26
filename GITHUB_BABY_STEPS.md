# GitHub Baby Steps — Ship open-model-contracts

**For people who just upgraded from "GitHub as storage unit" today.**

---

## Step 1: Create the Repo (Web Browser)

1. **Go to:** https://github.com/new

2. **Fill in the form:**
   - Repository name: `open-model-contracts`
   - Description: `The legal framework for AI model execution`
   - ✅ Public
   - ❌ DON'T check "Add a README" (we already have one)
   - ❌ DON'T check ".gitignore" (we already have one)
   - ❌ DON'T check "Choose a license" (we already have MIT)

3. **Click:** "Create repository" (green button)

4. **You'll see a page with commands.** STOP. Come back here.

---

## Step 2: Connect Your Local Folder (Terminal)

Open Terminal and run these commands **ONE AT A TIME** (copy/paste each line):

```bash
# Go to your project folder
cd /Users/joewales/NODE_OUT_Master/open-model-contracts

# Initialize git (if not already done)
git init

# Make sure you're on main branch
git branch -M main

# Add all files
git add .

# Commit with a message
git commit -m "Initial commit: open-model-contracts v1.0.0-alpha"

# Connect to GitHub (REPLACE 'Metatronsdoob369' with YOUR GitHub username)
git remote add origin https://github.com/Metatronsdoob369/open-model-contracts.git

# Push to GitHub
git push -u origin main
```

**That's it. Your code is now on GitHub.**

---

## Step 3: Tag the Release (Terminal)

```bash
# Create a version tag
git tag -a v1.0.0-alpha -m "First public release"

# Push the tag to GitHub
git push origin v1.0.0-alpha
```

**Now you have a tagged release.**

---

## Step 4: Create a Release (Web Browser)

1. **Go to your repo:** https://github.com/Metatronsdoob369/open-model-contracts

2. **Click:** "Releases" (right sidebar)

3. **Click:** "Create a new release" (or "Draft a new release")

4. **Fill in:**
   - Tag: `v1.0.0-alpha` (select from dropdown)
   - Release title: `v1.0.0-alpha — First Public Release`
   - Description: (copy from CHANGELOG.md)

5. **Click:** "Publish release" (green button)

**Boom. You just shipped a release.**

---

## Step 5: Share It (Social Media)

**Copy tweet from:** `TWEET.md`

**Get your repo link:** https://github.com/Metatronsdoob369/open-model-contracts

**Post to:**
- Twitter/X
- LinkedIn
- Reddit (r/MachineLearning, r/LocalLLaMA)
- Hacker News

**Done. You shipped.**

---

## Troubleshooting

### "fatal: remote origin already exists"

```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/open-model-contracts.git
```

### "Permission denied (publickey)"

You need to authenticate. Two options:

**Option 1: Use personal access token (easiest)**

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a name: "open-model-contracts"
4. Check: "repo" (full control)
5. Click "Generate token"
6. Copy the token (you'll only see it once!)
7. When git asks for password, paste the token

**Option 2: Use SSH key (better long-term)**

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Copy public key
cat ~/.ssh/id_ed25519.pub | pbcopy

# Go to: https://github.com/settings/keys
# Click "New SSH key"
# Paste the key, save

# Change remote to SSH
git remote set-url origin git@github.com:YOUR_USERNAME/open-model-contracts.git
```

### "Nothing to commit"

You already committed. Just run:

```bash
git push -u origin main
```

---

## What Just Happened?

1. ✅ Created a GitHub repo (web UI)
2. ✅ Connected your local folder to GitHub (git remote)
3. ✅ Pushed your code to GitHub (git push)
4. ✅ Tagged a release (git tag)
5. ✅ Created a release on GitHub (web UI)
6. ✅ Shared on social media

**You are now a GitHub user, not just a storage user.**

---

## Next Time (Future Repos)

The workflow is always:

```bash
# 1. Create repo on GitHub.com (web)
# 2. In terminal:
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/repo-name.git
git push -u origin main
```

**That's it. Same 5 commands every time.**

---

## GitHub Concepts You Just Learned

- **Repo** = A project folder on GitHub
- **Commit** = Save a snapshot of your code
- **Push** = Upload commits to GitHub
- **Tag** = Mark a specific version (like v1.0.0)
- **Release** = Publish a tagged version with notes

**You don't need to know anything else to ship code.**

---

## What You DON'T Need (Yet)

- Pull requests (for solo projects)
- Issues (unless you want feature tracking)
- Actions (CI/CD automation)
- Projects (kanban boards)
- Wiki (extra docs)
- GitHub Pages (static site hosting)

**Ignore all that. Just commit, push, tag, release, share.**

---

**Your balloon is reinflated. Time to launch. 🎈🚀**
