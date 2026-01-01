export let remoteDevtools: typeof import('./remoteDevtools').remoteDevtools

// @ts-ignore process.env.NODE_ENV is defined by metro transform plugins
if (process.env.NODE_ENV !== 'production') {
  const remoteDevtoolsModule = require('./remoteDevtools')
  remoteDevtools = remoteDevtoolsModule.remoteDevtools
} else {
  remoteDevtools = ((f) =>
    f) as typeof import('./remoteDevtools').remoteDevtools
}
