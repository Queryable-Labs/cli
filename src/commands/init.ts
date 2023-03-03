import * as fs from 'fs'
import path from 'path'
import { Command } from 'commander'
import colors from 'colors'
import Handlebars from 'handlebars'

interface DataSource {
    name: string
    ipfsPath: string
}

const dataSourcesMapping: { [name: string]: DataSource } = {
    'aptos-mainnet': {
        name: 'aptos_mainnet',
        ipfsPath:
            '/ipns/k2k4r8mfyz2yqj44njl1vb3m85jsnysm12bk4vbt5rti6mcv45psdn03',
    },
}

function init(
    program: Command,
    projectPath: string,
    dataSources: Array<string>
) {
    const verbosity = program.opts().verbose

    const manifestYamlPath = path.join(projectPath, 'queryable.yaml')
    const indexTsPath = path.join(projectPath, 'index.ts')
    const packageJsonPath = path.join(projectPath, 'package.json')

    if (fs.existsSync(manifestYamlPath)) {
        program.error('Folder already contains queryable.yaml, stopping...')
    }

    if (fs.existsSync(packageJsonPath)) {
        program.error('Folder already contains package.json, stopping...')
    }

    if (fs.existsSync(indexTsPath)) {
        program.error('Folder already contains index.ts, stopping...')
    }

    console.log(colors.green('Creating Queryable project files'))

    if (verbosity > 0) {
        console.log(colors.grey('Creating queryable.yaml'))
    }

    const manifestSource = fs
        .readFileSync('src/templates/init-queryable-manifest.yaml.hbs')
        .toString('utf-8')

    const manifestTemplate = Handlebars.compile(manifestSource)

    const detailedDataSources: Array<DataSource> = []

    let firstDataSource: DataSource

    for (const dataSource of dataSources) {
        detailedDataSources.push(dataSourcesMapping[dataSource])

        if (!firstDataSource) {
            firstDataSource = dataSourcesMapping[dataSource]
        }
    }

    const manifestResult = manifestTemplate({
        dataSources: detailedDataSources,
        firstDataSource,
    })

    fs.writeFileSync(manifestYamlPath, manifestResult)

    if (verbosity > 0) {
        console.log(colors.grey('Creating index.ts'))
    }

    const packageJsonSource = fs
        .readFileSync('src/templates/init-queryable-package.json.hbs')
        .toString('utf-8')

    const packageJsonTemplate = Handlebars.compile(packageJsonSource)

    const packageJsonResult = packageJsonTemplate({
        name: path.basename(path.resolve(projectPath)),
    })

    fs.writeFileSync(packageJsonPath, packageJsonResult)

    if (verbosity > 0) {
        console.log(colors.grey('Creating index.ts'))
    }

    const indexSource = fs
        .readFileSync('src/templates/init-queryable-index.ts.hbs')
        .toString('utf-8')

    const indexTemplate = Handlebars.compile(indexSource)

    const indexResult = indexTemplate({})

    fs.writeFileSync(indexTsPath, indexResult)

    console.log(colors.green('Done!'))
}

export default {
    init,
}
