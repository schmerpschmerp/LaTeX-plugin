# Paffle LaTeX Viewer

A simple Obsidian plugin that lets you open `.tex` or `.latex` files inside your vault and see a rendered preview using [latex.js](https://github.com/michael-brade/LaTeX.js). The preview lives in its own view so you can keep the source open in another tab or split pane.

## Features

- Registers a dedicated view for LaTeX files so they open with a rendered preview by default.
- Adds a ribbon icon and command palette action to open the preview manually for the current file.
- Automatically refreshes the preview when you save or modify the underlying file.

## Development

1. Install dependencies

   ```bash
   npm install
   ```

2. Build the plugin once

   ```bash
   npm run build
   ```

   The compiled `main.js`, `manifest.json`, and `styles.css` can then be copied into your Obsidian vault under `.obsidian/plugins/paffle-latex-viewer/`.

3. For active development you can keep esbuild running

   ```bash
   npm run dev
   ```

   This will rebuild `main.js` whenever you edit the source files. Reload Obsidian (`Ctrl/Cmd+R`) to pick up the changes.
