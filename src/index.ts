import colors from 'colors'
import * as fs from 'fs'
import { program, InvalidArgumentError } from 'commander'
import initCommand from './commands/init'
import codegenCommand from './commands/codegen'
import compileCommand from './commands/compile'
import publishCommand from './commands/publish'

function parseDirectoryPath(path: string) {
    if (fs.existsSync(path) && fs.lstatSync(path).isDirectory()) {
        return path
    } else {
        throw new InvalidArgumentError(
            'Provided path is not exist or not a folder.'
        )
    }
}

function increaseVerbosity(dummyValue: string, previous: number) {
    return previous + 1
}

program.option(
    '-v, --verbose',
    'define verbosity to show execution logs',
    increaseVerbosity,
    0
)

program
    .command('init')
    .argument(
        '<path>',
        'path to folder with queryable project',
        parseDirectoryPath,
        ''
    )
    .option(
        '--data-sources <sources>',
        'comma separated list of data sources, valid values (aptos-mainnet)'
    )
    .action((path: string, options: { dataSources: string }) => {
        const validatedSources = []

        if (options.dataSources) {
            const sources = (options.dataSources || '').split(',')

            const re = /^(aptos-mainnet)$/

            for (const source of sources) {
                if (re.test(source)) {
                    validatedSources.push(source)
                } else {
                    program.error(`Data source value ${source} is invalid`)
                }
            }
        }

        initCommand.init(program, path, validatedSources)
    })

program
    .command('codegen')
    .argument(
        '<path>',
        'path to folder with queryable project',
        parseDirectoryPath
    )
    .option(
        '--ipfs-gateway <url>',
        'url of ipfs gateway',
        'http://localhost:5001'
    )
    .description('generate entities')
    .action((path: string, options: { ipfsGateway: string }) => {
        codegenCommand.codegen(program, path, options.ipfsGateway)
    })

program
    .command('compile')
    .argument(
        '<path>',
        'path to folder with queryable project',
        parseDirectoryPath
    )
    .description('compile project')
    .action((path: string) => {
        compileCommand.compile(program, path)
    })

program
    .command('publish')
    .argument(
        '<path>',
        'path to folder with queryable project',
        parseDirectoryPath
    )
    .option(
        '--queryable-server-url <url>',
        'url of queryable server',
        'http://localhost:8081'
    )
    .option(
        '--ipfs-gateway <url>',
        'url of ipfs gateway',
        'http://localhost:5001'
    )
    .description('publish project')
    .action(
        (
            path: string,
            options: { queryableServerUrl: string; ipfsGateway: string }
        ) => {
            publishCommand.publish(
                program,
                path,
                options.queryableServerUrl,
                options.ipfsGateway
            )
        }
    )

program.configureOutput({
    // Visibly override write routines as example!
    writeOut: (str: string) => process.stdout.write(`[OUT] ${str}`),
    writeErr: (str: string) => process.stdout.write(`[ERR] ${str}`),
    // Highlight errors in color.
    outputError: (str: string, write: (str: string) => void) =>
        write(colors.red(str)),
})

program.parse()
