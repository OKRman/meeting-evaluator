# Meeting Effectiveness Evaluator — Deployment Guide

## What This Is

A standalone web tool that evaluates meeting transcripts using AI, hosted on Vercel (free).
Visitors paste a transcript → see their score → enter email to download the full report.
Emails are captured in ConvertKit for your nurture sequence.

## What You'll Need

1. **GitHub account** (free) — github.com
2. **Vercel account** (free, already done) — vercel.com
3. **ConvertKit account** (free, already done) — convertkit.com
4. **Anthropic API key** — console.anthropic.com (needs credit, ~1-2p per evaluation)

## Environment Variables You'll Set in Vercel

| Variable | Where to find it |
|----------|-----------------|
| `ANTHROPIC_API_KEY` | console.anthropic.com → API Keys |
| `CONVERTKIT_API_KEY` | ConvertKit → Settings → Developer |
| `CONVERTKIT_FORM_ID` | ConvertKit → Landing Pages & Forms → your form → the number in the URL |

## Step-by-Step Deployment

### Step 1: Create a ConvertKit Form (5 mins)

1. Log into ConvertKit
2. Go to **Grow** → **Landing Pages & Forms**
3. Click **Create New** → **Form**
4. Choose any template (we won't use the visual form — this is just for the API)
5. Name it "Meeting Evaluator Subscribers"
6. Note the **Form ID** — it's the number in the URL (e.g., if the URL is
   `https://app.convertkit.com/forms/designers/12345/edit`, the form ID is `12345`)
7. Optional: Create a **Tag** called "meeting-evaluator" to identify these leads

### Step 2: Get Your Anthropic API Key (5 mins)

1. Go to console.anthropic.com
2. Sign up or log in
3. Go to **API Keys** → **Create Key**
4. Copy the key (starts with `sk-ant-...`)
5. Add credit: **Billing** → add £10 (covers ~500+ evaluations)

### Step 3: Create a GitHub Repository (5 mins)

1. Go to github.com and sign up (free)
2. Click the **+** in the top right → **New repository**
3. Name: `meeting-evaluator`
4. Set to **Public** (Vercel free tier needs this)
5. Click **Create repository**
6. On the next page, click **"uploading an existing file"**
7. Drag and drop ALL the project files into the upload area:
   - `package.json`
   - `vercel.json`
   - `.gitignore`
   - `api/evaluate.js`
   - `api/subscribe.js`
   - `public/index.html`
8. Click **Commit changes**

### Step 4: Deploy to Vercel (5 mins)

1. Go to vercel.com and log in
2. Click **Add New...** → **Project**
3. Click **Import** next to your `meeting-evaluator` repository
4. Leave all settings as default
5. Before clicking Deploy, expand **Environment Variables**
6. Add these three variables:
   - Name: `ANTHROPIC_API_KEY` → Value: your Anthropic key
   - Name: `CONVERTKIT_API_KEY` → Value: your ConvertKit API key
   - Name: `CONVERTKIT_FORM_ID` → Value: your form ID from Step 1
7. Click **Deploy**
8. Wait ~60 seconds. You'll get a URL like `meeting-evaluator-xyz.vercel.app`

### Step 5: Test It (5 mins)

1. Visit your new URL
2. Click "Load sample meeting"
3. Click "Evaluate This Meeting"
4. Wait for the score to appear
5. Enter a test email and click "Get Report"
6. Check ConvertKit → **Subscribers** — your test email should appear
7. Check the downloaded report opens in your browser and looks good

### Step 6: Custom Domain (Optional, 10 mins)

If you want a branded URL like `evaluate.earntheright.uk`:

1. In Vercel, go to your project → **Settings** → **Domains**
2. Type `evaluate.earntheright.uk` → **Add**
3. Vercel will show you DNS records to add
4. In your domain registrar (wherever you bought earntheright.uk):
   - Add a CNAME record: `evaluate` → `cname.vercel-dns.com`
5. Wait 5-30 minutes for DNS to propagate
6. Vercel will automatically set up HTTPS

### Step 7: Link from Strikingly (5 mins)

1. Edit your Strikingly site
2. Add a new **Button** section or edit an existing CTA
3. Button text: "Score Your Meetings Free →"
4. Link to: your Vercel URL (e.g., `https://evaluate.earntheright.uk`)
5. Consider placing it:
   - In the main navigation
   - Below "The Problem" section (meetings drift into updates)
   - As a standalone section with a headline like "Think your meetings are productive? Prove it."

## Maintenance

- **Cost**: Vercel free tier = 100GB bandwidth/month (plenty). Anthropic = ~1-2p per evaluation.
- **Monitoring**: Check Vercel dashboard for usage. Check ConvertKit for subscribers.
- **Updates**: If you need changes, we'll update the files and push to GitHub. Vercel auto-deploys.

## File Structure

```
meeting-evaluator/
├── api/
│   ├── evaluate.js     ← Calls Anthropic API (keeps your key secure)
│   └── subscribe.js    ← Sends email to ConvertKit
├── public/
│   └── index.html      ← The entire front-end (what visitors see)
├── package.json        ← Dependencies
├── vercel.json         ← Vercel configuration
└── .gitignore          ← Files to exclude from Git
```
