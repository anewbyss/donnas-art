# opal.occult — portfolio website

A fast, shareable art portfolio with a gallery, collections (styles / eras / themes),
artwork pages with **Etsy** and **PayPal** purchase buttons, a contact / commission
form, social links, share buttons, and an RSS feed of new work.

**Editing content?** See **[EDITING-GUIDE.md](EDITING-GUIDE.md)** — no coding needed.

## What's inside

| Path | What it is |
|---|---|
| `src/artworks/` | One file per artwork |
| `src/categories/` | Collections (styles, eras, themes) |
| `src/pages/` | About, Contact, Thank-you pages |
| `src/_data/site.json` | Site settings: name, contact, socials, PayPal |
| `src/images/uploads/` | Uploaded images |
| `.pages.yml` | Editor setup for [Pages CMS](https://pagescms.org) |
| `.github/workflows/deploy.yml` | Publishes to GitHub Pages on every change |

Built with [Eleventy](https://www.11ty.dev/). Images are automatically resized into
fast-loading versions, so large photos are fine to upload.

## One-time setup

1. **Turn on hosting**: in GitHub go to **Settings → Pages** and set **Source** to
   **GitHub Actions**. The site publishes to `https://<username>.github.io/donnas-art/`.
   (Free GitHub Pages hosting requires the repository to be public.)
2. **Set up the editor**: visit [app.pagescms.org](https://app.pagescms.org), sign in
   with GitHub, and allow it access to this repository.
3. **Fill in Site settings** in the editor: name, email, social links, PayPal email.
4. **Replace the sample artwork** (files starting with `sample-`) with real pieces.
5. *(Optional)* **Custom domain** such as `opaloccult.com`:
   1. Buy the domain from any registrar (or from Shopify, if you also use Shopify).
   2. In the domain's DNS settings, add four **A** records for `@` pointing to
      `185.199.108.153`, `185.199.109.153`, `185.199.110.153` and `185.199.111.153`,
      and a **CNAME** record for `www` pointing to `anewbyss.github.io`.
   3. In GitHub, go to **Settings → Pages → Custom domain**, enter the domain, save,
      and tick **Enforce HTTPS** once it becomes available (this can take up to a day).
   4. Update **Website address** in Site settings.
6. *(Optional)* **Contact form to inbox**: create a free form at
   [formspree.io](https://formspree.io) and paste its link into Site settings.

## Running locally (for developers)

```bash
npm install
npm start      # http://localhost:8080
npm run build  # outputs to _site/
```
