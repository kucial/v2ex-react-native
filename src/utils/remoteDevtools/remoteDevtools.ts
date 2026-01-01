import 'react-native-get-random-values'

import { create as createSocket } from 'socketcluster-client'
import type {
  StateCreator,
  StoreApi,
  StoreMutatorIdentifier,
} from 'zustand/vanilla'

/**
 * DevToolsMessage + Action follow zustand-expo-devtools/withDevtools.ts
 * (exported here so this file is self-contained)
 */
export interface DevToolsMessage {
  type: 'ACTION' | 'DISPATCH' | string
  action?: string | { type: string; [key: string]: unknown }
  state?: string
  instanceId?: string | number
}

export type Action =
  | string
  | {
      type: string
      [x: string | number | symbol]: unknown
    }

/**
 * Type plumbing follows zustand's devtools.ts pattern
 */
type Cast<T, U> = T extends U ? T : U
type Write<T, U> = Omit<T, keyof U> & U

type TakeTwo<T> = T extends { length: 0 }
  ? [undefined, undefined]
  : T extends { length: 1 }
    ? [...args0: Cast<T, unknown[]>, arg1: undefined]
    : T extends { length: 0 | 1 }
      ? [...args0: Cast<T, unknown[]>, arg1: undefined]
      : T extends { length: 2 }
        ? T
        : T extends { length: 1 | 2 }
          ? T
          : T extends { length: 0 | 1 | 2 }
            ? T
            : T extends [infer A0, infer A1, ...unknown[]]
              ? [A0, A1]
              : T extends [infer A0, (infer A1)?, ...unknown[]]
                ? [A0, A1?]
                : T extends [(infer A0)?, (infer A1)?, ...unknown[]]
                  ? [A0?, A1?]
                  : never

type StoreRemoteDevtools<S> = S extends {
  setState: {
    (...args: infer Sa1): infer Sr1
    (...args: infer Sa2): infer Sr2
  }
}
  ? {
      setState(...args: [...args: TakeTwo<Sa1>, action?: Action]): Sr1
      setState(...args: [...args: TakeTwo<Sa2>, action?: Action]): Sr2
      devtools: {
        cleanup: () => void
      }
    }
  : never

type WithRemoteDevtools<S> = Write<S, StoreRemoteDevtools<S>>

declare module 'zustand/vanilla' {
  interface StoreMutators<S, A> {
    'zustand/remote-devtools': WithRemoteDevtools<S>
  }
}

export type NamedSet<T> = WithRemoteDevtools<StoreApi<T>>['setState']

export interface RemoteDevtoolsOptions {
  /** store name shown in devtools */
  name?: string
  /** socketcluster host */
  hostname?: string
  /** socketcluster port */
  port?: number
  /** use wss */
  secure?: boolean
  /** default: __DEV__ */
  enabled?: boolean
  /** fallback action type when none was provided */
  anonymousActionType?: string
}

type RemoteDevtools = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
  U = T,
>(
  initializer: StateCreator<
    T,
    [...Mps, ['zustand/remote-devtools', never]],
    Mcs,
    U
  >,
  options?: RemoteDevtoolsOptions,
) => StateCreator<T, Mps, [['zustand/remote-devtools', never], ...Mcs]>

/**
 * Runtime: remote connection follows zorro/react-native.ts
 * Action naming heuristics follow zustand-expo-devtools/withDevtools.ts
 */
const DEFAULT_OPTIONS: Required<
  Pick<
    RemoteDevtoolsOptions,
    'hostname' | 'port' | 'secure' | 'enabled' | 'anonymousActionType'
  >
> = {
  hostname: 'localhost',
  port: 8765,
  secure: false,
  enabled: __DEV__ as unknown as boolean,
  anonymousActionType: 'anonymous',
}

const ACTION_TYPES = {
  INIT: '@@INIT',
  NEW_STATE: '@@NEW_STATE',
  PAUSED: '@@PAUSED',
  RESUMED: '@@RESUMED',
  REHYDRATE: '@@REHYDRATE',
}

const generateArray = (length: number) => Array.from({ length }, (_, i) => i)

const safeJsonParse = <T>(json: string, context: string): T | null => {
  try {
    return JSON.parse(json) as T
  } catch (e) {
    console.error(`[remoteDevtools] Could not parse ${context}`, e)
    return null
  }
}

const remoteDevtoolsImpl = <T>(
  storeInitializer: StateCreator<T, [], []>,
  devtoolsOptions: RemoteDevtoolsOptions = {},
): StateCreator<T, [], []> => {
  return (set, get, api) => {
    const opts = { ...DEFAULT_OPTIONS, ...devtoolsOptions }
    const instanceId = devtoolsOptions.name ?? 'zustand-store'

    if (!opts.enabled) {
      return storeInitializer(set, get, api)
    }

    const socket = createSocket({
      hostname: opts.hostname,
      port: opts.port,
      secure: opts.secure,
    })

    let nextActionId = 0
    let initialState!: T

    const actionsById: Record<number, unknown> = {}
    const computedStates: { state: T }[] = []
    let isPaused = false
    let isRecording = true
    let isInitializing = true

    const pushNewState = (state: T, action: Action) => {
      const actionObj = typeof action === 'string' ? { type: action } : action
      actionsById[nextActionId++] = {
        type: 'PERFORM_ACTION',
        action: actionObj,
        timestamp: Date.now(),
      }
      computedStates.push({ state })
    }

    const sendMessage = (
      type: string,
      payload: unknown,
      action?: Action,
      forceSend?: boolean,
    ) => {
      if (!socket || socket.state === 'closed') return
      if (forceSend || !isPaused) {
        const actionObj =
          action == null
            ? { type: ACTION_TYPES.NEW_STATE }
            : typeof action === 'string'
              ? { type: action }
              : action
        socket.transmit('log', {
          type,
          ...(type === 'ACTION' ? { action: actionObj } : {}),
          payload,
          instanceId,
          id: socket.id,
          nextActionId,
        })
      }
    }

    const sendActualState = () => {
      sendMessage(
        'STATE',
        {
          monitorState: {},
          actionsById,
          nextActionId,
          stagedActionIds: generateArray(nextActionId),
          skippedActionIds: [],
          committedState: initialState,
          currentStateIndex: nextActionId,
          computedStates,
          isLocked: false,
          isPaused,
        },
        undefined,
        true,
      )
    }

    const handleInit = () => {
      initialState = get()
      pushNewState(initialState, ACTION_TYPES.INIT)
      sendMessage('INIT', initialState)
    }

    const createAction = (
      nameOrAction?: Action,
      replace?: boolean,
    ): { type: string } => {
      if (nameOrAction === undefined) {
        if (isInitializing) return { type: ACTION_TYPES.REHYDRATE }
        if (replace === true) return { type: ACTION_TYPES.REHYDRATE }
        return { type: opts.anonymousActionType }
      }
      if (typeof nameOrAction === 'string') return { type: nameOrAction }
      return nameOrAction
    }

    const setStateFromDevtools: StoreApi<T>['setState'] = (...a) => {
      const originalIsRecording = isRecording
      isRecording = false
      set(...(a as Parameters<typeof set>))
      isRecording = originalIsRecording
    }

    // Remote inbound (zorro-style)
    socket.invoke('login', 'master').then(async (channelName: string) => {
      handleInit()

      for await (const msg of socket.subscribe(
        channelName,
      ) as AsyncIterable<any>) {
        const type: string | undefined = msg?.type
        const action: any = msg?.action

        switch (type) {
          case 'DISPATCH': {
            const actionType = action?.type

            // zorro: pause recording toggle
            if (actionType === 'PAUSE_RECORDING') {
              isPaused = !!action?.status
              pushNewState(
                get(),
                isPaused ? ACTION_TYPES.PAUSED : ACTION_TYPES.RESUMED,
              )
              sendActualState()
              break
            }

            // (optional) redux-devtools-ish commands (if your server forwards them)
            if (actionType === 'RESET') {
              setStateFromDevtools(initialState as any, true)
              sendMessage('INIT', get())
              break
            }

            if (actionType === '__setState') {
              // allow remote to replace state
              setStateFromDevtools(action?.state as any, true)
              pushNewState(get(), '__setState')
              sendMessage('ACTION', get(), '__setState')
              break
            }

            if (
              actionType === 'ROLLBACK' ||
              actionType === 'JUMP_TO_STATE' ||
              actionType === 'JUMP_TO_ACTION'
            ) {
              if (typeof msg?.state === 'string') {
                const state = safeJsonParse<T>(msg.state, `${actionType} state`)
                if (state) setStateFromDevtools(state as any, true)
              }
              break
            }

            console.log(
              '[remoteDevtools] Unsupported dispatch type:',
              actionType,
            )
            break
          }

          case 'ACTION': {
            // Some servers send ACTION with action as a JSON string (like expo-devtools client)
            if (typeof msg?.action === 'string') {
              const parsed = safeJsonParse<any>(msg.action, 'ACTION action')
              if (parsed?.type === '__setState') {
                setStateFromDevtools(parsed.state as any, true)
              }
            }
            break
          }

          case 'START':
            sendActualState()
            break

          default:
            console.log('[remoteDevtools] Unsupported message type:', type)
        }
      }
    })

    // Patch setState (official devtools.ts approach)
    const originalSetState = api.setState
    ;(api.setState as any) = ((
      state: any,
      replace?: boolean,
      nameOrAction?: Action,
    ) => {
      const r =
        replace === true
          ? originalSetState(state, true as any)
          : originalSetState(state)

      if (!isRecording || isPaused) return r

      const actionObj = createAction(nameOrAction, replace)
      const next = get()

      pushNewState(next, actionObj)
      sendMessage('ACTION', next, actionObj)

      return r
    }) as NamedSet<T>

    // devtools cleanup hook (matches type augmentation)
    ;(api as StoreApi<T> & StoreRemoteDevtools<StoreApi<T>>).devtools = {
      cleanup: () => {
        try {
          socket?.disconnect?.()
        } catch {
          // ignored
        }
      },
    }

    // Build store using patched setState so initializer can pass action names
    const initial = storeInitializer(api.setState as any, get, api)

    // End of initialization: after this, unnamed sets are not assumed rehydrate
    isInitializing = false

    // If initializer returned state different from get(), ensure we track/send it
    // (Usually they match, but this keeps logs consistent.)
    const current = get()
    if (current !== initialState) {
      // initialState captured at handleInit(), but initial might have changed synchronously
      // Update the "init" snapshot to current
      initialState = current
      computedStates.length = 0
      nextActionId = 0
      for (const k of Object.keys(actionsById)) delete actionsById[Number(k)]
      pushNewState(initialState, ACTION_TYPES.INIT)
      sendMessage('INIT', initialState)
    }

    return initial
  }
}

export const remoteDevtools = remoteDevtoolsImpl as unknown as RemoteDevtools
