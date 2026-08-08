import ExpoModulesCore
import UIKit

/**
 Applies the app's theme accent to the window tint.

 UIKit resolves `tintColor` by walking up the view hierarchy, so setting it on
 the window is what colours the chrome the app cannot style from JS: alert and
 action sheet buttons, context menus, the share sheet, text selection handles.
 There is no React Native or Expo API for this, which is why the module exists.

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

      // Touching UIWindow off the main thread is undefined behaviour.
      DispatchQueue.main.async {
        for window in AccentColorModule.activeWindows() {
          window.tintColor = color
        }
      }
      return true
    }
  }

  /// Every foreground window, so a presented sheet or an external display picks
  /// up the change rather than keeping the previous tint.
  private static func activeWindows() -> [UIWindow] {
    return UIApplication.shared.connectedScenes
      .compactMap { $0 as? UIWindowScene }
      .flatMap { $0.windows }
  }
}

private extension UIColor {
  /// Parses `#RRGGBB` and `#RRGGBBAA`, the two forms `native-accents.json`
  /// allows. Returns nil rather than defaulting to black, so a bad value leaves
  /// the previous tint in place instead of silently blacking out the chrome.
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
