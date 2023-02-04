export const get2FASubmitCode = (code: string) => `(function() {
  try {
    const input = document.getElementById('otp_code');
    input.value = ${JSON.stringify(code)}
    document.querySelector('[type="submit"]').click();
  } catch (err) {
    window.ReactNativeWebView.postMessage(JSON.stringify({
      error: true,
      message: err.message
    }))
  }
}())`

export const checkAuthStatus = `
(function() {
  if (location.pathname === '/2fa') {
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: '2fa',
    }));
    return;
  }
  if (location.pathname === '/signin/cooldown') {
    const message = document.querySelector('#Wrapper .topic_content').textContent.trim();
    const info = document.querySelector('#Wrapper .dock_area').textContent.trim();
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'cooldown',
      payload: {
        message,
        info,
      }
    }))
    return
  }
  const username = document.querySelector('#menu-entry img.avatar')?.getAttribute('alt');
  if (username) {
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'login_success',
      payload: { username }
    }));
  } else if (location.pathname === '/') {
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'timeout',
      payload: ['请求超时'],
    }));
  } else {
    const problems = [
      ...document.querySelectorAll('.problem ul li')
    ].map((item) => item.textContent)
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'login_error',
      payload: problems
    }));
  }
}())
`
