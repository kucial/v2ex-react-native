import AppIntents
import SwiftUI
import WidgetKit

// MARK: - Models for Node Feed Widget

struct HomeFeedEntry: TimelineEntry {
  let date: Date
  let topics: [HomeFeedItem]
  let lastUpdated: String
  let maxItems: Int
  let family: WidgetFamily
  let node: NodeInfo
}

struct SelectedHomeFeeds: Codable {
  var feeds: [String]
    
  // Optional: convenience init for empty state
  static let empty = SelectedHomeFeeds(feeds: [])
}

struct NodeEntity: AppEntity {
  let id: String
  let displayName: String
  
  static var typeDisplayRepresentation: TypeDisplayRepresentation = "Node"
  static var defaultQuery = NodeQuery()
  
  var displayRepresentation: DisplayRepresentation {
    DisplayRepresentation(title: "\(displayName)")
  }
  
  init(nodeInfo: NodeInfo) {
    self.id = nodeInfo.name
    self.displayName = nodeInfo.title
  }
  
  init(id: String, displayName: String) {
    self.id = id
    self.displayName = displayName
  }
}

// MARK: - Node Query
struct NodeQuery: EntityQuery {
  func entities(for identifiers: [NodeEntity.ID]) async throws -> [NodeEntity] {
    allNodes().filter { identifiers.contains($0.id) }
  }
  
  func suggestedEntities() async throws -> [NodeEntity] {
    allNodes()
  }
  
  func defaultResult() async -> NodeEntity? {
    allNodes().first
  }
  
  private func allNodes() -> [NodeEntity] {
    // Load nodes from UserDefaults
    let userDefaults = UserDefaults(suiteName: "group.com.kucial.v2ex.data") ?? UserDefaults.standard
    
    if let data = userDefaults.data(forKey: "AvailableNodes"),
       let nodeInfoList = try? JSONDecoder().decode([NodeInfo].self, from: data) {
      return nodeInfoList.map { NodeEntity(nodeInfo: $0) }
    }
    
    // Fallback to default nodes if none are saved
    return [
      NodeEntity(id: "tech", displayName: "技术"),
      NodeEntity(id: "creative", displayName: "创意"),
      NodeEntity(id: "play", displayName: "好玩"),
      NodeEntity(id: "apple", displayName: "Apple"),
      NodeEntity(id: "jobs", displayName: "酷工作"),
      NodeEntity(id: "deals", displayName: "交易"),
      NodeEntity(id: "city", displayName: "城市"),
      NodeEntity(id: "qna", displayName: "问与答"),
    ]
  }
}

// MARK: - Node Feed Intent for Configuration

struct HomeFeedIntent: WidgetConfigurationIntent {
  static var title: LocalizedStringResource = "节点设置"
  static var description = IntentDescription("配置要显示哪些节点的主题。")
  
  @Parameter(title: "Node", default: NodeEntity(id: "tech", displayName: "技术"))
  var node: NodeEntity
  
  init() {
    self.node = NodeEntity(id: "tech", displayName: "技术") // Default node
  }
  
  init(node: NodeEntity) {
    self.node = node
  }
}

// MARK: - Node Feed Provider

struct HomeFeedProvider: AppIntentTimelineProvider {
  
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
  
  func placeholder(in context: Context) -> HomeFeedEntry {
    let maxItems = maxItems(for: context.family)
    
    return HomeFeedEntry(
      date: Date(),
      topics: [],
      lastUpdated: "从未",
      maxItems: maxItems,
      family: context.family,
      node: NodeInfo(name: "tech", title: "技术")
    )
  }
  
  func snapshot(for configuration: HomeFeedIntent, in context: Context) async -> HomeFeedEntry {
    let maxItems = maxItems(for: context.family)
    let data = loadHomeFeedDate(nodeName: configuration.node.id)
    let lastUpdated = data.lastUpdated != "" ? formatRelativeTime(from: data.lastUpdated) : ""
    return  HomeFeedEntry(
      date: Date(),
      topics: data.items,
      lastUpdated: lastUpdated,
      maxItems: maxItems,
      family: context.family,
      node: NodeInfo(name: configuration.node.id, title: configuration.node.displayName)
    )
  }
  
  func timeline(for configuration: HomeFeedIntent, in context: Context) async -> Timeline<
    HomeFeedEntry
  > {
    let maxItems = maxItems(for: context.family)
    
    // Save selected tab to shared storage.
    saveSelectedHomeTab(nodeName: configuration.node.id)
    
    let data = loadHomeFeedDate(nodeName: configuration.node.id)
    let lastUpdated = data.lastUpdated != "" ? formatRelativeTime(from: data.lastUpdated) : ""
    let entry = HomeFeedEntry(
      date: Date(),
      topics: data.items,
      lastUpdated: lastUpdated,
      maxItems: maxItems,
      family: context.family,
      node: NodeInfo(name: configuration.node.id, title: configuration.node.displayName)
    )
    
    let nextUpdate = Calendar.current.date(byAdding: .minute, value: 5, to: Date())!
    return Timeline(entries: [entry], policy: .after(nextUpdate))
  }
  
  private func saveSelectedHomeTab(nodeName: String)
  {
    let storageKey = "HomeFeedWidgetSelected"
    let defaults = UserDefaults(suiteName: "group.com.kucial.v2ex.data")

    let jsonString = defaults?.string(forKey: storageKey)

    var selectedFeeds: SelectedHomeFeeds = .empty

    if let jsonString = jsonString, let data = jsonString.data(using: .utf8) {
      do {
        selectedFeeds = try JSONDecoder().decode(SelectedHomeFeeds.self, from: data)
      } catch {
        print("Failed to decode SelectedHomeFeeds: \(error)")
        // config stays .empty
      }
    }
    
    // Only append if nodeName is not already in the array
    if !selectedFeeds.feeds.contains(nodeName) {
        selectedFeeds.feeds.append(nodeName)
    }
    
    // Encode and save back
    do {
        let data = try JSONEncoder().encode(selectedFeeds)
        guard let jsonString = String(data: data, encoding: .utf8) else {
            print("Failed to convert encoded data to string")
            return
        }
        defaults?.set(jsonString, forKey: storageKey)
    } catch {
        print("Failed to encode SelectedHomeFeeds: \(error)")
    }
  }
  
  private func loadHomeFeedDate(nodeName: String)
  -> HomeFeedData
  {
    let storageKey = "HomeFeedWidget_\(nodeName)"
    if let defaults = UserDefaults(suiteName: "group.com.kucial.v2ex.data"),
       let json = defaults.string(forKey: storageKey),
       let data = json.data(using: .utf8),
       let decoded = try? JSONDecoder().decode(HomeFeedData.self, from: data)
    {
      return decoded
    }
    
    return HomeFeedData(
      items: [],
      lastUpdated: "",
    )
  }
  
  private func formatRelativeTime(from isoString: String) -> String {
    let isoFormatter = ISO8601DateFormatter()
    isoFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    
    guard let date = isoFormatter.date(from: isoString) else {
      return isoString
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

// MARK: - Node Feed Widget View

struct HomeFeedWidgetView: View {
  var entry: HomeFeedEntry
  
  var body: some View {
    VStack(alignment: .leading, spacing: 0) {
      // Header with node title
      let feedURL = URL(string: "r2v://feed?tab=\(entry.node.name)")!
      Link(destination: feedURL) {
        HStack {
          Text("V2EX · \(entry.node.title)")
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
        Text("暂无话题")
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
            // Large widget: show title
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

// MARK: - Node Feed Widget

struct HomeFeedWidget: Widget {
  let kind: String = "com.kucial.v2ex.HomeFeedWidget"
  
  var body: some WidgetConfiguration {
    AppIntentConfiguration(
      kind: kind,
      intent: HomeFeedIntent.self,
      provider: HomeFeedProvider()
    ) { entry in
      HomeFeedWidgetView(entry: entry).containerBackground(.fill.tertiary, for: .widget)
    }
    .configurationDisplayName("V2EX 节点话题")
    .description("显示指定节点的 V2EX 话题")
    .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
  }
}

// MARK: - Preview

extension HomeFeedEntry {
  static var preview: HomeFeedEntry {
    HomeFeedEntry(
      date: Date(),
      topics: [
        HomeFeedItem(
          id: 1,
          title: "如何在 React Native 中实现 Widget",
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
      family: .systemSmall,
      node: NodeInfo(name: "qna", title: "问与答")
    )
  }
  
  static var emptyPreview: HomeFeedEntry {
    HomeFeedEntry(
      date: Date(),
      topics: [],
      lastUpdated: "无数据",
      maxItems: 2,
      family: .systemSmall,
      node: NodeInfo(name: "all", title: "全部")
    )
  }
}

#Preview("V2EX 节点话题", as: .systemSmall) {
  HomeFeedWidget()
} timeline: {
  HomeFeedEntry.preview
  HomeFeedEntry.emptyPreview
}
