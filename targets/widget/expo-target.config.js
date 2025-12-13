/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: 'widget',
  icon: '../../src/assets/icons/icon-r2v-light.png',
  entitlements: {
    'com.apple.security.application-groups': config.ios.entitlements?.[
      'com.apple.security.application-groups'
    ] || ['group.com.kucial.v2ex.data'],
  },
})
