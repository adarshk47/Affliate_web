# DealDesi — Indian affiliate deals site

A fast, free, multilingual (English / हिन्दी / Hinglish) affiliate site for Indian stores
(Amazon, Flipkart, Myntra, Meesho, AJIO, Nykaa, Tata CLiQ, JioMart, Croma, FirstCry).
Built with [Astro](https://astro.build) — static HTML, top page-speed scores, ad-ready.

**It updates itself daily:** a GitHub Action (06:00 IST) fetches products, rebuilds the site and deploys to GitHub Pages.

## Run locally

```bash
npm install
npm run update     # fetch products + build
npm run dev        # dev server at http://localhost:4321
```

## Go live (one-time, ~5 minutes)

1. Push this repo to GitHub, merge to `main`.
2. **Settings → Pages → Source: GitHub Actions.** (Free Pages needs a public repo.)
3. **Actions → "Daily update & deploy" → Run workflow.** Your site appears at
   `https://<your-username>.github.io/<repo-name>/`.

## Adding affiliate accounts later

Do the signups yourself (they need your PAN/bank KYC), then add the IDs as
**Settings → Secrets and variables → Actions → Secrets**:

| Secret | What it does |
|---|---|
| `AMAZON_ASSOCIATE_TAG` | Your Amazon tag (e.g. `mysite-21`) is added to every Amazon link |
| `FLIPKART_AFFILIATE_ID` / `FLIPKART_AFFILIATE_TOKEN` | Enables the daily Flipkart "Deals of the Day" feed |
| `CUELINKS_API_KEY` | Enables the Cuelinks feed (Myntra, Meesho, AJIO, Nykaa, and more) |

Until a source is connected the site shows clearly-labelled **demo products**.
They disappear automatically as soon as real products exist.

> Please verify the API field names in `scripts/adapters/flipkart.mjs` and `cuelinks.mjs`
> against each provider's docs once your account is approved — they were written
> without API access.

### Adding products by hand (works today)

Edit `data/manual/products.csv` (columns: `store,category,title,price,mrp,url,affiliate_url,image,rating,expires`).
If `affiliate_url` is filled it is used as-is; otherwise your Amazon/Flipkart ID is added to `url`.
Manual items stay until their `expires` date.
Categories: `electronics`, `fashion`, `home-kitchen`, `beauty`, `baby-kids`.

### Adding another feed

Copy `scripts/adapters/cuelinks.mjs`, return `[{ title, store, category, price, mrp, url, affiliateUrl, image }]`,
and add it to the list in `scripts/fetch-products.mjs`.

## Connecting your domain later

1. Buy the domain, then **Settings → Pages → Custom domain**.
2. **Settings → Secrets and variables → Actions → Variables**: `SITE_URL=https://yourdomain.in`, `BASE_PATH=/`.
3. Run the workflow again.

## Turning on ads

Apply for Google AdSense **after** you have a custom domain, real guides and the legal pages.
Then set the variable `PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX`. Ad units are already placed
via `src/components/AdSlot.astro`.

## Content matters

Google and AdSense penalise sites that are only auto-generated product lists. Write real buying guides in
`src/guides/<lang>/<slug>.md` (see the smartphone example). Aim for 30+ useful guides.

## Before you launch checklist

- [ ] Replace `CONTACT_EMAIL` in `src/i18n/pages.mjs`
- [ ] Rename the site in `src/site.config.mjs`
- [ ] Don't scrape store websites — use official APIs/feeds or the CSV
- [ ] Keep the affiliate disclosure visible (it's in the footer and on guides)
