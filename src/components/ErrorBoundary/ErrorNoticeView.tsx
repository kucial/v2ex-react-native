import {
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import { useTheme } from '@/containers/ThemeService'

type Props = {
  onReset: (event: GestureResponderEvent) => void
  onRestart: (event: GestureResponderEvent) => void
}

export default function ErrorNoticeView(props: Props) {
  const { styles } = useTheme()
  return (
    <View style={[errorNoticeStyles.container, styles.layer1]}>
      <View style={errorNoticeStyles.contentWrap}>
        <View style={errorNoticeStyles.innerWrap}>
          <View style={errorNoticeStyles.titleRow}>
            <Text style={[errorNoticeStyles.titleText, styles.text]}>
              哎呦，出了点问题
            </Text>
          </View>
          <Text
            style={[errorNoticeStyles.descText, styles.text, styles.text_base]}
          >
            应用程序遇到问题，无法继续。 {'\n'}我们道歉对于由此造成的任何不便！
            {'\n'}
            按下下方按钮即可 重新启动应用程序。{'\n'}
            如果此问题仍然存在，请与我们联系。
          </Text>
          <View style={errorNoticeStyles.btnWrap}>
            <Pressable
              style={({ pressed }) => [
                errorNoticeStyles.button,
                styles.btn_primary__bg,
                pressed && errorNoticeStyles.pressed,
              ]}
              onPress={props.onRestart}
            >
              <Text style={[styles.btn_primary__text, styles.text_base]}>
                重新启动APP
              </Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                errorNoticeStyles.button,
                errorNoticeStyles.mt6,
                styles.btn_danger__bg,
                pressed && errorNoticeStyles.pressed,
              ]}
              onPress={props.onReset}
            >
              <Text style={[styles.btn_danger__text, styles.text_base]}>
                重置 APP
              </Text>
            </Pressable>
            <View style={errorNoticeStyles.mt2}>
              <Text
                style={[
                  errorNoticeStyles.textCenter,
                  styles.text_meta,
                  styles.text_xs,
                ]}
              >
                （清理缓存）
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}

const errorNoticeStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentWrap: {
    paddingHorizontal: 16,
    paddingBottom: 64,
  },
  innerWrap: {
    paddingTop: 48,
  },
  titleRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  titleText: {
    fontSize: 32,
  },
  descText: {
    marginBottom: 32,
  },
  btnWrap: {
    maxWidth: 300,
    width: '100%',
  },
  button: {
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mt6: {
    marginTop: 24,
  },
  mt2: {
    marginTop: 8,
  },
  textCenter: {
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
})
