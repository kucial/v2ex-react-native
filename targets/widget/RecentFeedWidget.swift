import AppIntents
import SwiftUI
import WidgetKit

// MARK: - Models
struct RecentFeedEntry: TimelineEntry {
    let date: Date
    let topics: [HomeFeedItem]
    let lastUpdated: String
    let maxItems: Int
    let family: WidgetFamily
}

// MARK: - Provider

struct RecentFeedProvider: TimelineProvider {
    private func maxItems(for family: WidgetFamily) -> Int {
        switch family {
        case .systemSmall:
            return 3
        case .systemMedium:
            return 3
        default:
            return 7
        }
    }
    func placeholder(in context: Context) -> RecentFeedEntry {
        let maxItems = maxItems(for: context.family)

        return RecentFeedEntry(
            date: Date(),
            topics: [],
            lastUpdated: "从未",
            maxItems: maxItems,
            family: context.family
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (RecentFeedEntry) -> Void) {
        let maxItems = maxItems(for: context.family)
        Task {
            let entry = await loadRecentFeedEntry(maxItems: maxItems, family: context.family)
            completion(entry)
        }
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<RecentFeedEntry>) -> Void)
    {
        let maxItems = maxItems(for: context.family)
        Task {
            let entry = await loadRecentFeedEntry(maxItems: maxItems, family: context.family)
            let nextUpdate = Calendar.current.date(byAdding: .minute, value: 30, to: Date())!
            let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
            completion(timeline)
        }
    }

    private func loadRecentFeedEntry(maxItems: Int, family: WidgetFamily) async -> RecentFeedEntry {
        if let defaults = UserDefaults(suiteName: "group.com.kucial.v2ex.data"),
            let json = defaults.string(forKey: "RecentFeedWidget"),
            let data = json.data(using: .utf8),
            let decoded = try? JSONDecoder().decode(RecentFeedData.self, from: data)
        {
            let formattedLastUpdated = formatRelativeTime(from: decoded.lastUpdated)
            return RecentFeedEntry(
                date: Date(),
                topics: decoded.items,
                lastUpdated: formattedLastUpdated,
                maxItems: maxItems,
                family: family
            )
        }

        return RecentFeedEntry(
            date: Date(),
            topics: [],
            lastUpdated: "无数据",
            maxItems: maxItems,
            family: family
        )
    }

    private func formatRelativeTime(from isoString: String) -> String {
        let isoFormatter = ISO8601DateFormatter()
        isoFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

        guard let date = isoFormatter.date(from: isoString) else {
            return isoString  // fallback to original string if parsing fails
        }

        let now = Date()
        let diffSeconds = Int(now.timeIntervalSince(date))

        if diffSeconds < 60 {
            return "刚刚"
        } else if diffSeconds < 3600 {
            let minutes = diffSeconds / 60
            return "\(minutes)分钟前"
        } else if diffSeconds < 86400 {
            let hours = diffSeconds / 3600
            return "\(hours)小时前"
        } else {
            let days = diffSeconds / 86400
            return "\(days)天前"
        }
    }
}

// MARK: - View

struct RecentFeedWidgetView: View {
    var entry: RecentFeedEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            let feedURL = URL(string: "r2v://feed?tab=recent")!
            // Header
            Link(destination: feedURL) {
              HStack {
                Text(
                  "V2EX · 最近话题"
                )
                .font(.system(size: 12))
                .fontWeight(.bold)
                
                Spacer()
                
                if entry.family != .systemSmall {
                  Text(entry.lastUpdated)
                    .font(.caption)
                    .foregroundColor(.secondary)
                }
                
              }
              .padding(.bottom, 4)
            }
       
            if entry.topics.isEmpty {
                Text("暂无最近话题")
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
                    .padding(.vertical, 4)
            } else {
                ForEach(Array(entry.topics.prefix(entry.maxItems).enumerated()), id: \.element.id) {
                    (index, topic) in
                    let topicURL = URL(string: "r2v://topic/\(topic.id)")!

                    if entry.family == .systemSmall {
                        // Small widget: show only title
                        Link(destination: topicURL) {
                            Text(topic.title)
                                .font(.system(size: 14))
                                .lineLimit(3)
                                .padding(.vertical, 6)
                        }
                    } else if entry.family == .systemMedium {
                        Link(destination: topicURL) {
                            HStack(alignment: .center) {

                                Text("\(index + 1)")
                                    .font(.system(size: 14))
                                    .fontWeight(.bold)
                                    .padding(.trailing, 3)

                                VStack(spacing: 0) {
                                    VStack {
                                        Text(topic.title)
                                            .font(.system(size: 15))
                                            .lineLimit(1)
                                    }
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                    .frame(height: 40, alignment: .leading)

                                    Divider()
                                }
                            }
                        }
                    } else {
                        // Medium/Large widget: show title
                        Link(destination: topicURL) {
                            HStack(alignment: .center) {
                                Text("\(index + 1)")
                                    .font(.system(size: 15))
                                    .fontWeight(.bold)
                                    .padding(.trailing, 3)

                                VStack(spacing: 0) {
                                    VStack {
                                        Text(topic.title)
                                            .font(.system(size: 16))
                                            .lineLimit(1)
                                    }
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                    .frame(height: 44, alignment: .leading)

                                    Divider()
                                }
                            }
                        }
                    }
                }
            }
        }
        .padding(.horizontal, 0)
        .padding(.vertical, 0)
    }
}

// MARK: - Widget

struct RecentFeedWidget: Widget {
    let kind: String = "com.kucial.v2ex.recentWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(
            kind: kind,
            provider: RecentFeedProvider()
        ) { entry in
            RecentFeedWidgetView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("V2EX 最近话题")
        .description("显示 V2EX 的最近话题")
    }
}

// MARK: - Preview

extension RecentFeedEntry {
    static var preview: RecentFeedEntry {
        RecentFeedEntry(
            date: Date(),
            topics: [
                HomeFeedItem(
                    id: 1,
                    title: "How to implement a widget in React Native",
                    replies: 25,
                    member: MemberInfo(
                        username: "developer",
                        avatar_mini: "",
                        avatar_normal: "",
                        avatar_large: ""),
                    node: NodeInfo(name: "qna", title: "问与答"),
                    last_reply_time: nil,
                    last_reply_by: nil
                )
            ],
            lastUpdated: "5分钟前",
            maxItems: 2,
            family: .systemSmall
        )
    }

    static var emptyPreview: RecentFeedEntry {
        RecentFeedEntry(
            date: Date(),
            topics: [],
            lastUpdated: "无数据",
            maxItems: 2,
            family: .systemSmall
        )
    }
}

#Preview("V2EX 最近话题", as: .systemSmall) {
    RecentFeedWidget()
} timeline: {
    RecentFeedEntry.preview
    RecentFeedEntry.emptyPreview
}
