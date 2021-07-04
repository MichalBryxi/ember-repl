import { getTemplateLocals } from '@glimmer/syntax';

import * as Babel from '@babel/standalone';
import HTMLBars, { preprocessEmbeddedTemplates } from 'babel-plugin-htmlbars-inline-precompile';
import { precompile as precompileTemplate } from 'ember-template-compiler';

import { evalSnippet } from './eval';

export interface Info {
  code: string;
  name: string;
}

export function compileJS() {

}

export function compileHBS() {

}

/**
  * TODO:
  *  - pull in the name generator / hasher
  *  - return the generated name
  *  - add instructions for how to invoke
    *  - add instructions for how to use your own components
  *
  */
export async function compile(js: Info[]) {
  let rawCode = await Promise.all(
    js.map(async ({ name, code }) => {
      let compiled = await compileGJS({ code, name });

      return { name, code: compiled } as Info;
    })
  );

  let modules = rawCode.map((info) => ({ name: info.name, ...evalSnippet(info.code) }));

  return modules;
}

async function compileGJS({ code: input, name }: Info) {
  let preprocessed = preprocessEmbeddedTemplates(input, {
    getTemplateLocals,
    relativePath: `${name}.js`,
    includeSourceMaps: false,
    includeTemplateTokens: true,
    templateTag: 'template',
    templateTagReplacement: 'GLIMMER_TEMPLATE',
    getTemplateLocalsExportPath: 'getTemplateLocals',
  });

  let result = Babel.transform(preprocessed.output, {
    filename: `${name}.js`,
    plugins: [
      [
        HTMLBars,
        {
          precompile: precompileTemplate,
          // this needs to be true until Ember 3.27+
          ensureModuleApiPolyfill: false,
          modules: {
            'ember-template-imports': {
              export: 'hbs',
              useTemplateLiteralProposalSemantics: 1,
            },

            'TEMPLATE-TAG-MODULE': {
              export: 'GLIMMER_TEMPLATE',
              debugName: '<template>',
              useTemplateTagProposalSemantics: 1,
            },
          },
        },
      ],
      [Babel.availablePlugins['proposal-decorators'], { legacy: true }],
      [Babel.availablePlugins['proposal-class-properties']],
    ],
    presets: [
      [
        Babel.availablePresets['env'],
        {
          // false -- keeps ES Modules
          modules: 'cjs',
          targets: { esmodules: true },
          loose: true,
          forceAllTransforms: false,
        },
      ],
    ],
  });

  if (!result) {
    return;
  }

  let { code } = result;

  return code;
}
