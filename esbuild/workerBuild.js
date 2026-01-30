import esbuild from 'esbuild'

process.on('message', async ({ entryPoints, mode }) => {
  const baseOptions = {
    entryPoints,
    entryNames: '[dir]/[name]',
    bundle: true,
    platform: 'node',
    target: 'node20',
    outdir: 'dist',
    outbase: 'src',
    logLevel: 'info',
    external: [
    '@aws-sdk/client-dynamodb',
    '@aws-sdk/lib-dynamodb',
    'buffer',
    'joi'
  ]
  }

  const buildOptions = {
    main: {
      ...baseOptions,
      minify: true,
      format: 'esm'
    },
    offline: {
      ...baseOptions,
      keepNames: true,
      format: 'esm'
    }
  }

  // Validación del modo de build
  if (!buildOptions[mode]) {
    process.send({
      status: 'error',
      workerId: process.pid,
      error: `Invalid build mode: ${mode}`
    })
    return
  }

  try {
    console.log(`🔨 Worker ${process.pid} building ${entryPoints.length} files...`)
    await esbuild.build(buildOptions[mode])

    process.send({
      status: 'success',
      workerId: process.pid,
      files: entryPoints
    })
  } catch (error) {
    process.send({
      status: 'error',
      workerId: process.pid,
      error: error.message
    })
  }
})
