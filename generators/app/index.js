const path = require('path')
const mkdirp = require('mkdirp')
const Generator = require('yeoman-generator')
const kebabCase = require('lodash.kebabcase')

module.exports = class extends Generator {
  init() {
    return this.prompt([
      {
        name: 'moduleName',
        message: 'What do you want to name your module?',
        default: this.appname.replace(/\s/g, '-'),
        filter: x => kebabCase(x).toLowerCase(),
      },
      {
        name: 'description',
        message: `What's the project description?`,
        type: 'input',
      },
      {
        name: "typescript",
        message: "Does this project use TypeScript?",
        type: "confirm"
      },
      {
        name: 'packageManager',
        message: "Which package manager do you want for installation?",
        type: "list",
        choices: ["npm", "yarn", "No installation please"]
      }
    ]).then(props => {

      // Bank the answers.
      this.answers = props;

      const mv = (from, to) => {
        this.fs.move(this.destinationPath(from), this.destinationPath(to))
      }
      console.log(this.templatePath())

      this.fs.copyTpl(
        [`${this.templatePath()}/**`, `!${this.templatePath()}/**/_tsconfig.json`],
        this.destinationPath(),
        props,
      )

      mv('gitattributes', '.gitattributes')
      mv('gitignore', '.gitignore')
      mv('npmrc', '.npmrc')
      mv('_package.json', 'package.json')
      mv('prettierrc', '.prettierrc')
      mv('prettierignore', '.prettierignore')
      mv('lintstagedrc', '.lintstagedrc')
      mv('eslint.js', '.eslintrc.js')
      mv('eslintignore', '.eslintignore')
      mv('.husky', '.huskyrc')

      if (props.typescript) {
        mkdirp(path.join(this.destinationPath("local_types")))
        this.fs.copyTpl(
          [`${this.templatePath()}/**/_tsconfig.json`],
          this.destinationPath(),
          props,
        )
        mv('_tsconfig.json', 'tsconfig.json')
      }


    })
  }
  install() {
    this.spawnCommand('git', ['init'])
    if (this.answers.packageManager === "npm") {
      this.npmInstall()
    }
    else if (this.answers.packageManager === "yarn") {
      this.yarnInstall()
    }
  }
}
