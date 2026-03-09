import Foundation

public enum SiriClaw-InstructChatTransportEvent: Sendable {
    case health(ok: Bool)
    case tick
    case chat(SiriClaw-InstructChatEventPayload)
    case agent(SiriClaw-InstructAgentEventPayload)
    case seqGap
}

public protocol SiriClaw-InstructChatTransport: Sendable {
    func requestHistory(sessionKey: String) async throws -> SiriClaw-InstructChatHistoryPayload
    func sendMessage(
        sessionKey: String,
        message: String,
        thinking: String,
        idempotencyKey: String,
        attachments: [SiriClaw-InstructChatAttachmentPayload]) async throws -> SiriClaw-InstructChatSendResponse

    func abortRun(sessionKey: String, runId: String) async throws
    func listSessions(limit: Int?) async throws -> SiriClaw-InstructChatSessionsListResponse

    func requestHealth(timeoutMs: Int) async throws -> Bool
    func events() -> AsyncStream<SiriClaw-InstructChatTransportEvent>

    func setActiveSessionKey(_ sessionKey: String) async throws
}

extension SiriClaw-InstructChatTransport {
    public func setActiveSessionKey(_: String) async throws {}

    public func abortRun(sessionKey _: String, runId _: String) async throws {
        throw NSError(
            domain: "SiriClaw-InstructChatTransport",
            code: 0,
            userInfo: [NSLocalizedDescriptionKey: "chat.abort not supported by this transport"])
    }

    public func listSessions(limit _: Int?) async throws -> SiriClaw-InstructChatSessionsListResponse {
        throw NSError(
            domain: "SiriClaw-InstructChatTransport",
            code: 0,
            userInfo: [NSLocalizedDescriptionKey: "sessions.list not supported by this transport"])
    }
}
