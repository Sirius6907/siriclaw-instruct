import ActivityKit
import Foundation

/// Shared schema used by iOS app + Live Activity widget extension.
struct SiriClaw-InstructActivityAttributes: ActivityAttributes {
    var agentName: String
    var sessionKey: String

    struct ContentState: Codable, Hashable {
        var statusText: String
        var isIdle: Bool
        var isDisconnected: Bool
        var isConnecting: Bool
        var startedAt: Date
    }
}

#if DEBUG
extension SiriClaw-InstructActivityAttributes {
    static let preview = SiriClaw-InstructActivityAttributes(agentName: "main", sessionKey: "main")
}

extension SiriClaw-InstructActivityAttributes.ContentState {
    static let connecting = SiriClaw-InstructActivityAttributes.ContentState(
        statusText: "Connecting...",
        isIdle: false,
        isDisconnected: false,
        isConnecting: true,
        startedAt: .now)

    static let idle = SiriClaw-InstructActivityAttributes.ContentState(
        statusText: "Idle",
        isIdle: true,
        isDisconnected: false,
        isConnecting: false,
        startedAt: .now)

    static let disconnected = SiriClaw-InstructActivityAttributes.ContentState(
        statusText: "Disconnected",
        isIdle: false,
        isDisconnected: true,
        isConnecting: false,
        startedAt: .now)
}
#endif

