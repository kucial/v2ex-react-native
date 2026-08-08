import ExpoModulesCore
import UIKit

/**
 Applies the app's theme accent to the UIKit tint.

 UIKit resolves `tintColor` by walking up the view hierarchy, so this is what
 colours the chrome the app cannot style from JS: alert and action sheet
 buttons, context menus, the share sheet, text selection handles. There is no
 React Native or Expo API for it, which is why the module exists.

 `androidStyle` is ignored here; the two platforms need different inputs (a
 colour vs. a style resource) and keeping one JS signature avoids a
 platform-forked call site.
 */
public class AccentColorModule: Module {
  public func definition() -> ModuleDefinition {
    Name("AccentColor")

    Function("setAccentColor") { (hex: String, _: String?) -> Bool in
      guard let color = UIColor(hex: hex) else {
        return false
      }

      var applied = false
      // Synchronous so the return value means something, and safe to call from
      // whichever queue the module runs on.
      EXUtilities.performSynchronously {
        // React Native builds every Alert inside a throwaway UIWindow of its
        // own, created at present time and torn down on dismiss
        // (RCTAlertController.alertWindow). Tinting the windows that exist now
        // can never reach it — only the appearance proxy, which applies to
        // views created afterwards, does.
        UIView.appearance().tintColor = color

        // The proxy leaves existing views alone, so tint the live windows too.
        // That covers context menus, text handles and anything already on
        // screen when the theme changes.
        for window in Self.activeWindows() {
          window.tintColor = color
        }
        applied = true
      }
      return applied
    }
  }

  private static func activeWindows() -> [UIWindow] {
    var windows: [UIWindow] = []

    // How expo-system-ui reaches the app window. The app has no
    // UIApplicationSceneManifest, so connectedScenes cannot be relied on to
    // return anything — that was the original bug here.
    if let delegateWindow = UIApplication.shared.delegate?.window,
       let window = delegateWindow {
      windows.append(window)
    }

    // Still worth scanning, for a scene-adopting build or an external display.
    for scene in UIApplication.shared.connectedScenes {
      guard let windowScene = scene as? UIWindowScene else { continue }
      for window in windowScene.windows where !windows.contains(window) {
        windows.append(window)
      }
    }

    return windows
  }
}

private extension UIColor {
  /// Parses `#RRGGBB` and `#RRGGBBAA`, the two forms `native-accents.json`
  /// allows. Returns nil rather than defaulting to black, so a bad value leaves
  /// the previous tint in place instead of blacking out the chrome.
  convenience init?(hex: String) {
    var value = hex.trimmingCharacters(in: .whitespacesAndNewlines)
    if value.hasPrefix("#") {
      value.removeFirst()
    }

    guard value.count == 6 || value.count == 8,
          let raw = UInt64(value, radix: 16) else {
      return nil
    }

    let hasAlpha = value.count == 8
    let red = CGFloat((raw >> (hasAlpha ? 24 : 16)) & 0xFF) / 255
    let green = CGFloat((raw >> (hasAlpha ? 16 : 8)) & 0xFF) / 255
    let blue = CGFloat((raw >> (hasAlpha ? 8 : 0)) & 0xFF) / 255
    let alpha = hasAlpha ? CGFloat(raw & 0xFF) / 255 : 1

    self.init(red: red, green: green, blue: blue, alpha: alpha)
  }
}
