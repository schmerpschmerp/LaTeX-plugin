import { Notice, Plugin, TFile, TextFileView, WorkspaceLeaf, debounce } from 'obsidian';
import { HtmlGenerator, parse } from 'latex.js';

const LATEX_VIEW_TYPE = 'paffle-latex-view';
const SUPPORTED_EXTENSIONS = ['tex', 'latex'];

class LatexPreviewView extends TextFileView {
  private readonly bodyEl: HTMLElement;
  private readonly messageEl: HTMLElement;
  private readonly assetEl: HTMLElement;
  private renderLater: () => void;
  private currentSource = '';

  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
    this.contentEl.addClass('latex-preview-view');
    this.messageEl = this.contentEl.createDiv('latex-preview-view__message');
    this.bodyEl = this.contentEl.createDiv('latex-preview-view__body');
    this.assetEl = this.contentEl.createDiv('latex-preview-view__assets');
    this.assetEl.setAttr('aria-hidden', 'true');
    this.renderLater = debounce(() => this.renderLatex(), 200, false);
  }

  getViewType(): string {
    return LATEX_VIEW_TYPE;
  }

  getDisplayText(): string {
    return this.file ? `${this.file.basename} (LaTeX preview)` : 'LaTeX preview';
  }

  async onOpen() {
    await super.onOpen();
    this.registerEvent(
      this.app.vault.on('modify', (file) => {
        if (this.file && file.path === this.file.path) {
          void this.reloadFromDisk();
        }
      }),
    );
  }

  async onLoadFile(file: TFile): Promise<void> {
    await super.onLoadFile(file);
    await this.reloadFromDisk();
  }

  async onUnloadFile(file: TFile): Promise<void> {
    await super.onUnloadFile(file);
    this.currentSource = '';
    this.bodyEl.empty();
    this.assetEl.empty();
    this.messageEl.empty();
  }

  private async reloadFromDisk() {
    if (!this.file) {
      return;
    }
    this.currentSource = await this.app.vault.read(this.file);
    this.renderLater();
  }

  private renderLatex() {
    this.bodyEl.empty();
    this.assetEl.empty();
    this.messageEl.empty();

    if (!this.currentSource.trim()) {
      this.messageEl.setText('This LaTeX file is empty.');
      return;
    }

    try {
      const generator = new HtmlGenerator({ hyphenate: false });
      parse(this.currentSource, { generator });
      this.bodyEl.appendChild(generator.domFragment());
      if (generator.stylesAndScripts) {
        this.assetEl.innerHTML = generator.stylesAndScripts;
      }
    } catch (error) {
      console.error('Unable to render LaTeX file', error);
      this.messageEl.setText('Unable to render LaTeX. Check the developer console for details.');
    }
  }
}

export default class PaffleLatexViewerPlugin extends Plugin {
  async onload() {
    this.registerView(LATEX_VIEW_TYPE, (leaf) => new LatexPreviewView(leaf));
    this.registerExtensions(SUPPORTED_EXTENSIONS, LATEX_VIEW_TYPE);

    this.addRibbonIcon('sigma', 'Open LaTeX preview', () => {
      void this.openPreviewForActiveFile();
    });

    this.addCommand({
      id: 'open-latex-preview',
      name: 'Open LaTeX preview for current file',
      checkCallback: (checking) => {
        const activeFile = this.app.workspace.getActiveFile();
        if (!activeFile || !SUPPORTED_EXTENSIONS.contains(activeFile.extension)) {
          return false;
        }
        if (!checking) {
          void this.activateView(activeFile);
        }
        return true;
      },
    });
  }

  onunload() {
    this.app.workspace.detachLeavesOfType(LATEX_VIEW_TYPE);
  }

  private async openPreviewForActiveFile() {
    const file = this.app.workspace.getActiveFile();
    if (!file || !SUPPORTED_EXTENSIONS.contains(file.extension)) {
      new Notice('Open a .tex file before launching the preview.');
      return;
    }
    await this.activateView(file);
  }

  private async activateView(file: TFile) {
    const leaf = this.app.workspace.getLeaf(true);
    await leaf.setViewState({
      type: LATEX_VIEW_TYPE,
      state: { file: file.path },
      active: true,
    });
    this.app.workspace.revealLeaf(leaf);
  }
}
