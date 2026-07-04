import { useEffect, useState } from 'react'
import { Button, StyleSheet, Text, View } from 'react-native'
import * as BackgroundTask from 'expo-background-task'
import * as TaskManager from 'expo-task-manager'

import { useTheme } from '@/containers/ThemeService'
import {
  BACKGROUND_TASK_IDENTIFIER,
  registerBackgroundTaskAsync,
  unregisterBackgroundTaskAsync,
} from '@/lib/widget-background-task'

export default function BackgroundTaskScreen() {
  const { styles } = useTheme()
  const [isRegistered, setIsRegistered] = useState<boolean>(false)
  const [status, setStatus] =
    useState<BackgroundTask.BackgroundTaskStatus | null>(null)

  useEffect(() => {
    updateAsync()
  }, [])

  const updateAsync = async () => {
    const status = await BackgroundTask.getStatusAsync()
    setStatus(status)
    const isRegistered = await TaskManager.isTaskRegisteredAsync(
      BACKGROUND_TASK_IDENTIFIER,
    )
    setIsRegistered(isRegistered)
  }

  const toggle = async () => {
    try {
      if (!isRegistered) {
        await registerBackgroundTaskAsync()
      } else {
        await unregisterBackgroundTaskAsync()
      }
      await updateAsync()
    } catch (err) {
      console.log(err)
    }
  }

  const triggerTask = async () => {
    await BackgroundTask.triggerTaskWorkerForTestingAsync()
  }

  return (
    <View style={bgStyles.container}>
      <View>
        <Text style={styles.text}>
          Background Task Service Availability:{' '}
          <Text style={{ fontWeight: 'bold' }}>
            {status ? BackgroundTask.BackgroundTaskStatus[status] : null}
          </Text>
        </Text>
      </View>
      <Button
        disabled={status === BackgroundTask.BackgroundTaskStatus.Restricted}
        title={
          isRegistered ? 'Cancel Background Task' : 'Schedule Background Task'
        }
        onPress={toggle}
      />
      <Button title='Check Background Task Status' onPress={updateAsync} />

      <Button title='Test Task' onPress={triggerTask} />
    </View>
  )
}

const bgStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
