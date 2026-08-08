package expo.modules.accentcolor

import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * Applies the app's theme accent to the activity theme.
 *
 * `colorPrimary` / `colorAccent` are theme attributes, so unlike iOS they
 * cannot be set from a colour value — they have to come from a style resource.
 * `plugins/withThemeAccentColors.js` generates one style per theme and variant
 * at prebuild time, and this resolves it by name.
 *
 * No activity recreation is needed. React Native builds dialogs with
 * `AlertDialog.Builder(activityContext)` (AlertFragment.kt), which resolves
 * theme attributes when the dialog is created, so everything opened after this
 * call picks up the new accent. Views already on screen keep the old one, which
 * does not matter: RN draws its own UI from JS.
 */
class AccentColorModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("AccentColor")

    Function("setAccentColor") { _: String, androidStyle: String? ->
      val styleName = androidStyle?.takeIf { it.isNotBlank() } ?: return@Function false
      val activity = appContext.currentActivity ?: throw Exceptions.MissingActivity()

      val styleId = activity.resources.getIdentifier(styleName, "style", activity.packageName)
      // A style name from a JS build newer than this binary resolves to 0.
      // Leaving the current theme alone beats throwing on a cosmetic change.
      if (styleId == 0) {
        return@Function false
      }

      activity.runOnUiThread { activity.setTheme(styleId) }
      true
    }
  }
}
