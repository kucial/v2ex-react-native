import { AxiosError } from 'axios'

import {
  isImageLoadNoise,
  isImageLoadNoiseEvent,
  isTransportNoise,
  isTransportNoiseEvent,
} from '@/lib/sentry'

jest.mock('@sentry/react-native', () => ({
  reactNavigationIntegration: () => ({}),
  init: jest.fn(),
  setExtras: jest.fn(),
  setTag: jest.fn(),
}))

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { expoConfig: { extra: {} }, sessionId: 's', linkingUri: 'l' },
}))
jest.mock('expo-device', () => ({ deviceYearClass: 2020 }))
jest.mock('expo-updates', () => ({ manifest: {}, channel: 'test' }))

describe('isTransportNoise', () => {
  it('matches the axios timeout this app produces', () => {
    // what axios throws for `timeout: REQUEST_TIMEOUT` (10s)
    const err = new AxiosError(
      'timeout of 10000ms exceeded',
      AxiosError.ECONNABORTED,
    )
    expect(isTransportNoise(err)).toBe(true)
  })

  it('matches a timeout even when `code` is missing', () => {
    expect(isTransportNoise({ message: 'timeout of 10000ms exceeded' })).toBe(
      true,
    )
    expect(isTransportNoise({ message: 'timeout of 15000ms exceeded' })).toBe(
      true,
    )
  })

  it.each(['ECONNABORTED', 'ETIMEDOUT', 'ERR_CANCELED', 'ERR_NETWORK'])(
    'treats %s as noise',
    (code) => {
      expect(isTransportNoise({ code })).toBe(true)
    },
  )

  it('still reports real failures', () => {
    // an HTTP 500 is a genuine signal and must reach Sentry
    expect(
      isTransportNoise(
        new AxiosError(
          'Request failed with status code 500',
          'ERR_BAD_RESPONSE',
        ),
      ),
    ).toBe(false)
    expect(isTransportNoise(new TypeError('x is not a function'))).toBe(false)
    expect(isTransportNoise(new Error('parse failed'))).toBe(false)
  })

  it('does not match prose that merely mentions a timeout', () => {
    expect(
      isTransportNoise({ message: 'the timeout of 10000ms exceeded us' }),
    ).toBe(false)
    expect(isTransportNoise({ message: 'V2EX 响应超时，请稍后重试。' })).toBe(
      false,
    )
  })

  it('tolerates junk input', () => {
    for (const value of [null, undefined, 0, '', 'timeout', [], NaN]) {
      expect(isTransportNoise(value)).toBe(false)
    }
  })
})

describe('isTransportNoiseEvent', () => {
  it('drops the bare-message timeout that V2EX-REACT-NATIVE-5P reported', () => {
    // `captureEvent(axiosError)` produced exactly this: a `default` event
    // carrying the message, with no exception interface and no stacktrace.
    expect(
      isTransportNoiseEvent({ message: 'timeout of 10000ms exceeded' }),
    ).toBe(true)
  })

  it('drops a timeout carried on the exception interface', () => {
    expect(
      isTransportNoiseEvent({
        exception: {
          values: [{ value: 'timeout of 10000ms exceeded' }],
        },
      }),
    ).toBe(true)
  })

  it('keeps real failures', () => {
    expect(
      isTransportNoiseEvent({ message: 'Request failed with status code 500' }),
    ).toBe(false)
    expect(
      isTransportNoiseEvent({
        exception: { values: [{ value: 'x is not a function' }] },
      }),
    ).toBe(false)
  })

  it('drops a chained exception whose cause is a timeout', () => {
    expect(
      isTransportNoiseEvent({
        exception: {
          values: [
            { value: 'timeout of 10000ms exceeded' },
            { value: 'Failed to load topics' },
          ],
        },
      }),
    ).toBe(true)
  })

  it('tolerates an empty event', () => {
    expect(isTransportNoiseEvent({})).toBe(false)
    expect(isTransportNoiseEvent({ exception: { values: [] } })).toBe(false)
    expect(isTransportNoiseEvent({ exception: {} })).toBe(false)
  })
})

describe('image load noise', () => {
  const message =
    'Could not get the image from given url: https://example.com/deleted.png'

  it('drops the expected unavailable remote-image exception', () => {
    expect(isImageLoadNoise(new Error(message))).toBe(true)
    expect(
      isImageLoadNoiseEvent({ exception: { values: [{ value: message }] } }),
    ).toBe(true)
    expect(isImageLoadNoiseEvent({ message })).toBe(true)
  })

  it('requires the exact library message and a non-empty URL', () => {
    expect(isImageLoadNoise(new Error('Could not get the image'))).toBe(false)
    expect(
      isImageLoadNoise(new Error('Could not get the image from given url: ')),
    ).toBe(false)
    expect(
      isImageLoadNoise(
        new Error('Upload failed for https://example.com/deleted.png'),
      ),
    ).toBe(false)
  })
})
