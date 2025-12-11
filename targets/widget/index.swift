import SwiftUI
import WidgetKit

@main
struct exportWidgets: WidgetBundle {
    var body: some Widget {
        // Export widgets here
        HotTopicsWidget()
        HomeFeedWidget()
        RecentFeedWidget()
    }
}
