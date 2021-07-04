// Types for compiled templates
// declare module 'ember-play/templates/*' {
//   import type { TemplateFactory } from 'htmlbars-inline-precompile';
//   const tmpl: TemplateFactory;
//   export default tmpl;
// }

// provided by vendor/ember/ember-template-compiler.js (somehow)
declare module 'ember-template-compiler';

declare module '@ember/helper';
declare module '@ember/modifier';
declare module '@ember/template-factory';
declare module '@glimmer/babel-preset';

declare module 'babel-plugin-htmlbars-inline-precompile';
declare module '@babel/plugin-proposal-decorators';

declare module '@ember/template-compilation' {
  export interface CompileOptions {
    moduleName: string;
    strictMode: boolean;
    locals: Array<unknown>;
    isProduction: boolean;
    meta: Record<string, unknown>;
    plugins: {
      ast: Array<unknown>
    }
  }
  export function compileTemplate(template: string, options: CompileOptions): any;
}
