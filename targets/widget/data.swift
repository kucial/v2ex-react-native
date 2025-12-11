struct NodeInfo: Codable, Hashable {
    let name: String
    let title: String
}

struct HomeFeedItem: Codable, Hashable, Identifiable {
  let id: Int
  let title: String
  let replies: Int
  let member: MemberInfo
  let node: NodeInfo
  let last_reply_time: String?
  let last_reply_by: String?
}

struct MemberInfo: Codable, Hashable {
    let username: String
    let avatar_mini: String
    let avatar_normal: String
    let avatar_large: String
}

struct HotTopicsData: Codable {
    let items: [HomeFeedItem]
    let lastUpdated: String
}

struct HomeFeedData: Codable {
  let items: [HomeFeedItem]
  let lastUpdated: String
}

struct RecentFeedData: Codable {
  let items: [HomeFeedItem]
  let lastUpdated: String
}


// NEXT: custom node feed.

struct NodeTopicItem: Codable, Hashable, Identifiable {
    let id: Int
    let title: String
    let replies: Int
    let member: MemberInfo
}

struct NodeFeedData: Codable {
    let items: [NodeTopicItem]
    let lastUpdated: String
    let node: NodeInfo
}
