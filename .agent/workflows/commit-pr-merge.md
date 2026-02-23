---
description: how to commit, push, create PRs, and merge changes to the upstream repo
---

# Git Commit, PR & Merge Workflow

This project lives on a **forked repo** (`nelcostaa/LandlordAuditReport`), with upstream at `jameshunt8082/LandlordAuditReport`. All changes must be committed incrementally, pushed to the fork, then merged via PR to upstream.

## 1. Commit Changes Incrementally

Make **small, atomic commits** — one commit per logical change. Never bundle unrelated changes into a single commit.

Examples of good commit boundaries:
- One file fix = one commit
- One feature across 2-3 related files = one commit
- One bug fix = one commit
- Config changes = separate commit
- UI tweaks = separate commit

```bash
# Stage only the files for THIS specific change
git add path/to/file1.ts path/to/file2.tsx

# Write a concise, descriptive commit message
# Format: type(scope): description
# Types: feat, fix, refactor, docs, chore, debug, style
git commit -m "feat(checkout): enable promotion codes on Stripe Checkout"
```

// turbo-all

**Do NOT:**
- `git add -A` and commit everything at once
- Bundle unrelated changes (e.g., a bug fix + a new feature)
- Use vague messages like "update files" or "fix stuff"
- Use emojis in commit messages

## 2. Push to Fork

After making all commits for the current work session:

```bash
git push origin main
```

If GitHub Push Protection blocks the push (secret detected), fix it:
```bash
git reset --soft HEAD~1
# Remove the offending file from staging
git reset HEAD path/to/secret-file
# Add it to .gitignore
echo "path/to/secret-file" >> .gitignore
# Re-commit without the secret file
git add -A -- ':!path/to/secret-file'
git add .gitignore
git commit -m "original commit message"
git push origin main
```

## 3. Create PR to Upstream

Once all changes are pushed to the fork, create a PR to the upstream repo:

```bash
gh pr create \
  --repo jameshunt8082/LandlordAuditReport \
  --head nelcostaa:main \
  --base main \
  --title "Brief descriptive title of all changes" \
  --body "## Changes
- Change 1 description
- Change 2 description
- Change 3 description"
```

The PR title should summarize the batch of work. The body should list each individual change.

## 4. Merge PR to Upstream

After the PR is created, merge it:

```bash
gh pr merge <PR_NUMBER> \
  --repo jameshunt8082/LandlordAuditReport \
  --merge \
  --admin
```

## 5. Sync Fork (if needed)

If the upstream has changes not in the fork:

```bash
gh repo sync nelcostaa/LandlordAuditReport --branch main
git pull origin main
```

## Complete Example Session

```bash
# Fix 1: Update email template
git add lib/email.ts
git commit -m "fix(email): update questionnaire email template wording"

# Fix 2: Add new API endpoint
git add app/api/stripe/products/route.ts
git commit -m "feat(stripe): add products listing API endpoint"

# Fix 3: Update frontend to use new API
git add components/payment/PricingSection.tsx components/payment/PaymentModal.tsx
git commit -m "feat(pricing): fetch products dynamically from Stripe"

# Fix 4: Config change
git add lib/product-config.ts
git commit -m "feat(config): add local product display configuration"

# Push all commits
git push origin main

# Create and merge PR
gh pr create --repo jameshunt8082/LandlordAuditReport --head nelcostaa:main --base main --title "Dynamic Stripe pricing and email fixes" --body "## Changes
- Fix email template
- Add products API
- Dynamic frontend pricing
- Product display config"

gh pr merge <PR_NUMBER> --repo jameshunt8082/LandlordAuditReport --merge --admin
```
