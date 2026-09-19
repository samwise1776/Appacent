# Appacent

Appacent is a dependency-free app center designed for GitHub Pages. It includes a curated catalog, ten sample apps to experiment with, download counters, a repository signal view, and a browser-local app creator.

## Run it

Open `index.html` in a browser, or serve the repository with any static server:

```bash
python3 -m http.server
```

Download counts and apps created through the form are stored in `localStorage` for the current browser. The catalog is intentionally static so the site can deploy directly to GitHub Pages without a server or API key. Replace the sample repositories in `app.js` with real projects when publishing.

## GitHub Pages

In the repository settings, choose **Pages → Deploy from a branch**, select `main` and `/ (root)`. Because the site only uses relative assets, it works at both a custom domain and a project Pages URL.
