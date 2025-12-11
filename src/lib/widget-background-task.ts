import { Platform } from 'react-native'
import { ExtensionStorage } from '@bacons/apple-targets'
import * as BackgroundTask from 'expo-background-task'
import * as TaskManager from 'expo-task-manager'

import { getHomeFeeds, getHotTopics } from '@/utils/v2ex-client'
import { HomeTopicFeed } from '@/utils/v2ex-client/types'

export const BACKGROUND_TASK_IDENTIFIER = 'widget-background-task'

const storage = new ExtensionStorage(
  // Your app group identifier. Should match the values in the app.json and expo-target.config.json.
  'group.com.kucial.v2ex.data',
)
export const updateHotsFeedWidget = async (items: HomeTopicFeed[]) => {
  if (Platform.OS === 'ios') {
    try {
      storage.set(
        'TodayHotsFeedWidget',
        JSON.stringify({
          items: items,
          lastUpdated: new Date().toISOString(),
        }),
      )
      ExtensionStorage.reloadWidget('TodayHotsFeedWidget')
      console.log('TodayHotsFeedWidget updated successfully')
    } catch (error) {
      console.error('Failed to update widget:', error)
    }
  }
}

export const updateRecentWidgetFeedWidget = async (items: HomeTopicFeed[]) => {
  if (Platform.OS === 'ios') {
    try {
      storage.set(
        'RecentFeedWidget',
        JSON.stringify({
          items: items,
          lastUpdated: new Date().toISOString(),
        }),
      )
      ExtensionStorage.reloadWidget('RecentFeedWidget')
      console.log('RecentFeedWidget updated successfully')
    } catch (error) {
      console.error('Failed to update widget:', error)
    }
  }
}

export const updateHomeFeedWidget = async (
  tab: string,
  items: HomeTopicFeed[],
) => {
  if (Platform.OS === 'ios') {
    try {
      const data = {
        items: items,
        lastUpdated: new Date().toISOString(),
      }
      storage.set(`HomeFeedWidget_${tab}`, JSON.stringify(data))
      ExtensionStorage.reloadWidget()
      console.log(`HomeFeedWidget_${tab} updated successfully`)
    } catch (error) {
      console.error(`Failed to update node widget (${tab}):`, error)
    }
  }
}

TaskManager.defineTask(BACKGROUND_TASK_IDENTIFIER, async () => {
  try {
    // Update hot topics widget
    const { data } = await getHotTopics()
    updateHotsFeedWidget(data)

    const selectedHomeFeedsJson = storage.get('HomeFeedWidgetSelected')
    if (selectedHomeFeedsJson) {
      try {
        const settings: { feeds: string[] } = JSON.parse(selectedHomeFeedsJson)

        // Optional: validate that settings.feeds is actually an array
        if (Array.isArray(settings.feeds) && settings.feeds.length > 0) {
          // Process each tab sequentially or in parallel
          // Option 1: Sequential (preserves order, avoids rate limits)
          for (const tab of settings.feeds) {
            try {
              const { data } = await getHomeFeeds({ tab })
              updateHomeFeedWidget(tab, data)
            } catch (error) {
              console.error(`Failed to fetch data for tab "${tab}":`, error)
              // Continue with other tabs even if one fails
            }
          }
        } else {
          console.warn('Selected feeds is empty or invalid:', settings.feeds)
        }
      } catch (error) {
        console.error('Failed to parse HomeFeedWidgetSelected JSON:', error)
        // Optionally clear corrupted data
        // await storage.remove('HomeFeedWidgetSelected');
      }
    }
  } catch (error) {
    console.error('Failed to execute the background task:', error)
    return BackgroundTask.BackgroundTaskResult.Failed
  }
  return BackgroundTask.BackgroundTaskResult.Success
})

export async function registerBackgroundTaskAsync() {
  return BackgroundTask.registerTaskAsync(BACKGROUND_TASK_IDENTIFIER)
}

export async function unregisterBackgroundTaskAsync() {
  return BackgroundTask.unregisterTaskAsync(BACKGROUND_TASK_IDENTIFIER)
}
