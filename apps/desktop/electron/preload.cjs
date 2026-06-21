const { contextBridge, ipcRenderer, webUtils } = require('electron')

contextBridge.exposeInMainWorld('shuoziDesktop', {
  getConnection: profile => ipcRenderer.invoke('shuozi:connection', profile),
  revalidateConnection: () => ipcRenderer.invoke('shuozi:connection:revalidate'),
  touchBackend: profile => ipcRenderer.invoke('shuozi:backend:touch', profile),
  getGatewayWsUrl: profile => ipcRenderer.invoke('shuozi:gateway:ws-url', profile),
  openSessionWindow: (sessionId, opts) => ipcRenderer.invoke('shuozi:window:openSession', sessionId, opts),
  getBootProgress: () => ipcRenderer.invoke('shuozi:boot-progress:get'),
  getConnectionConfig: profile => ipcRenderer.invoke('shuozi:connection-config:get', profile),
  saveConnectionConfig: payload => ipcRenderer.invoke('shuozi:connection-config:save', payload),
  applyConnectionConfig: payload => ipcRenderer.invoke('shuozi:connection-config:apply', payload),
  testConnectionConfig: payload => ipcRenderer.invoke('shuozi:connection-config:test', payload),
  probeConnectionConfig: remoteUrl => ipcRenderer.invoke('shuozi:connection-config:probe', remoteUrl),
  oauthLoginConnectionConfig: remoteUrl => ipcRenderer.invoke('shuozi:connection-config:oauth-login', remoteUrl),
  oauthLogoutConnectionConfig: remoteUrl => ipcRenderer.invoke('shuozi:connection-config:oauth-logout', remoteUrl),
  profile: {
    get: () => ipcRenderer.invoke('shuozi:profile:get'),
    set: name => ipcRenderer.invoke('shuozi:profile:set', name)
  },
  api: request => ipcRenderer.invoke('shuozi:api', request),
  notify: payload => ipcRenderer.invoke('shuozi:notify', payload),
  requestMicrophoneAccess: () => ipcRenderer.invoke('shuozi:requestMicrophoneAccess'),
  readFileDataUrl: filePath => ipcRenderer.invoke('shuozi:readFileDataUrl', filePath),
  readFileText: filePath => ipcRenderer.invoke('shuozi:readFileText', filePath),
  selectPaths: options => ipcRenderer.invoke('shuozi:selectPaths', options),
  writeClipboard: text => ipcRenderer.invoke('shuozi:writeClipboard', text),
  saveImageFromUrl: url => ipcRenderer.invoke('shuozi:saveImageFromUrl', url),
  saveImageBuffer: (data, ext) => ipcRenderer.invoke('shuozi:saveImageBuffer', { data, ext }),
  saveClipboardImage: () => ipcRenderer.invoke('shuozi:saveClipboardImage'),
  getPathForFile: file => {
    try {
      return webUtils.getPathForFile(file) || ''
    } catch {
      return ''
    }
  },
  normalizePreviewTarget: (target, baseDir) => ipcRenderer.invoke('shuozi:normalizePreviewTarget', target, baseDir),
  watchPreviewFile: url => ipcRenderer.invoke('shuozi:watchPreviewFile', url),
  stopPreviewFileWatch: id => ipcRenderer.invoke('shuozi:stopPreviewFileWatch', id),
  setTitleBarTheme: payload => ipcRenderer.send('shuozi:titlebar-theme', payload),
  setNativeTheme: mode => ipcRenderer.send('shuozi:native-theme', mode),
  setTranslucency: payload => ipcRenderer.send('shuozi:translucency', payload),
  setPreviewShortcutActive: active => ipcRenderer.send('shuozi:previewShortcutActive', Boolean(active)),
  openExternal: url => ipcRenderer.invoke('shuozi:openExternal', url),
  fetchLinkTitle: url => ipcRenderer.invoke('shuozi:fetchLinkTitle', url),
  sanitizeWorkspaceCwd: cwd => ipcRenderer.invoke('shuozi:workspace:sanitize', cwd),
  settings: {
    getDefaultProjectDir: () => ipcRenderer.invoke('shuozi:setting:defaultProjectDir:get'),
    setDefaultProjectDir: dir => ipcRenderer.invoke('shuozi:setting:defaultProjectDir:set', dir),
    pickDefaultProjectDir: () => ipcRenderer.invoke('shuozi:setting:defaultProjectDir:pick')
  },
  revealLogs: () => ipcRenderer.invoke('shuozi:logs:reveal'),
  getRecentLogs: () => ipcRenderer.invoke('shuozi:logs:recent'),
  readDir: dirPath => ipcRenderer.invoke('shuozi:fs:readDir', dirPath),
  gitRoot: startPath => ipcRenderer.invoke('shuozi:fs:gitRoot', startPath),
  worktrees: cwds => ipcRenderer.invoke('shuozi:fs:worktrees', cwds),
  terminal: {
    dispose: id => ipcRenderer.invoke('shuozi:terminal:dispose', id),
    resize: (id, size) => ipcRenderer.invoke('shuozi:terminal:resize', id, size),
    start: options => ipcRenderer.invoke('shuozi:terminal:start', options),
    write: (id, data) => ipcRenderer.invoke('shuozi:terminal:write', id, data),
    onData: (id, callback) => {
      const channel = `shuozi:terminal:${id}:data`
      const listener = (_event, payload) => callback(payload)
      ipcRenderer.on(channel, listener)
      return () => ipcRenderer.removeListener(channel, listener)
    },
    onExit: (id, callback) => {
      const channel = `shuozi:terminal:${id}:exit`
      const listener = (_event, payload) => callback(payload)
      ipcRenderer.on(channel, listener)
      return () => ipcRenderer.removeListener(channel, listener)
    }
  },
  onClosePreviewRequested: callback => {
    const listener = () => callback()
    ipcRenderer.on('shuozi:close-preview-requested', listener)
    return () => ipcRenderer.removeListener('shuozi:close-preview-requested', listener)
  },
  onOpenUpdatesRequested: callback => {
    const listener = () => callback()
    ipcRenderer.on('shuozi:open-updates', listener)
    return () => ipcRenderer.removeListener('shuozi:open-updates', listener)
  },
  onDeepLink: callback => {
    const listener = (_event, payload) => callback(payload)
    ipcRenderer.on('shuozi:deep-link', listener)
    return () => ipcRenderer.removeListener('shuozi:deep-link', listener)
  },
  signalDeepLinkReady: () => ipcRenderer.invoke('shuozi:deep-link-ready'),
  onWindowStateChanged: callback => {
    const listener = (_event, payload) => callback(payload)
    ipcRenderer.on('shuozi:window-state-changed', listener)
    return () => ipcRenderer.removeListener('shuozi:window-state-changed', listener)
  },
  onPreviewFileChanged: callback => {
    const listener = (_event, payload) => callback(payload)
    ipcRenderer.on('shuozi:preview-file-changed', listener)
    return () => ipcRenderer.removeListener('shuozi:preview-file-changed', listener)
  },
  onBackendExit: callback => {
    const listener = (_event, payload) => callback(payload)
    ipcRenderer.on('shuozi:backend-exit', listener)
    return () => ipcRenderer.removeListener('shuozi:backend-exit', listener)
  },
  onPowerResume: callback => {
    const listener = () => callback()
    ipcRenderer.on('shuozi:power-resume', listener)
    return () => ipcRenderer.removeListener('shuozi:power-resume', listener)
  },
  onBootProgress: callback => {
    const listener = (_event, payload) => callback(payload)
    ipcRenderer.on('shuozi:boot-progress', listener)
    return () => ipcRenderer.removeListener('shuozi:boot-progress', listener)
  },
  // First-launch bootstrap progress -- emitted by the install.ps1 stage
  // runner in main.cjs (apps/desktop/electron/bootstrap-runner.cjs).
  // Renderer's install overlay subscribes to live events and queries the
  // current snapshot via getBootstrapState() to recover after a devtools
  // reload mid-bootstrap.
  getBootstrapState: () => ipcRenderer.invoke('shuozi:bootstrap:get'),
  resetBootstrap: () => ipcRenderer.invoke('shuozi:bootstrap:reset'),
  repairBootstrap: () => ipcRenderer.invoke('shuozi:bootstrap:repair'),
  cancelBootstrap: () => ipcRenderer.invoke('shuozi:bootstrap:cancel'),
  onBootstrapEvent: callback => {
    const listener = (_event, payload) => callback(payload)
    ipcRenderer.on('shuozi:bootstrap:event', listener)
    return () => ipcRenderer.removeListener('shuozi:bootstrap:event', listener)
  },
  getVersion: () => ipcRenderer.invoke('shuozi:version'),
  uninstall: {
    summary: () => ipcRenderer.invoke('shuozi:uninstall:summary'),
    run: mode => ipcRenderer.invoke('shuozi:uninstall:run', { mode })
  },
  updates: {
    check: () => ipcRenderer.invoke('shuozi:updates:check'),
    apply: opts => ipcRenderer.invoke('shuozi:updates:apply', opts),
    getBranch: () => ipcRenderer.invoke('shuozi:updates:branch:get'),
    setBranch: name => ipcRenderer.invoke('shuozi:updates:branch:set', name),
    onProgress: callback => {
      const listener = (_event, payload) => callback(payload)
      ipcRenderer.on('shuozi:updates:progress', listener)
      return () => ipcRenderer.removeListener('shuozi:updates:progress', listener)
    }
  },
  themes: {
    fetchMarketplace: id => ipcRenderer.invoke('shuozi:vscode-theme:fetch', id),
    searchMarketplace: query => ipcRenderer.invoke('shuozi:vscode-theme:search', query)
  }
})
