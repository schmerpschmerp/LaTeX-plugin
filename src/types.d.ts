declare module 'latex.js' {
  export interface HtmlGeneratorOptions {
    hyphenate?: boolean;
    shellEscape?: boolean;
  }

  export class HtmlGenerator {
    constructor(options?: HtmlGeneratorOptions);
    domFragment(): DocumentFragment;
    stylesAndScripts: string;
  }

  export interface ParseOptions {
    generator: HtmlGenerator;
  }

  export function parse(input: string, options: ParseOptions): { htmlDocument(): void };
}
