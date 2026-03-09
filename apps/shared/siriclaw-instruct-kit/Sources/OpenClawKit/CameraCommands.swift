import Foundation

public enum SiriClaw-InstructCameraCommand: String, Codable, Sendable {
    case list = "camera.list"
    case snap = "camera.snap"
    case clip = "camera.clip"
}

public enum SiriClaw-InstructCameraFacing: String, Codable, Sendable {
    case back
    case front
}

public enum SiriClaw-InstructCameraImageFormat: String, Codable, Sendable {
    case jpg
    case jpeg
}

public enum SiriClaw-InstructCameraVideoFormat: String, Codable, Sendable {
    case mp4
}

public struct SiriClaw-InstructCameraSnapParams: Codable, Sendable, Equatable {
    public var facing: SiriClaw-InstructCameraFacing?
    public var maxWidth: Int?
    public var quality: Double?
    public var format: SiriClaw-InstructCameraImageFormat?
    public var deviceId: String?
    public var delayMs: Int?

    public init(
        facing: SiriClaw-InstructCameraFacing? = nil,
        maxWidth: Int? = nil,
        quality: Double? = nil,
        format: SiriClaw-InstructCameraImageFormat? = nil,
        deviceId: String? = nil,
        delayMs: Int? = nil)
    {
        self.facing = facing
        self.maxWidth = maxWidth
        self.quality = quality
        self.format = format
        self.deviceId = deviceId
        self.delayMs = delayMs
    }
}

public struct SiriClaw-InstructCameraClipParams: Codable, Sendable, Equatable {
    public var facing: SiriClaw-InstructCameraFacing?
    public var durationMs: Int?
    public var includeAudio: Bool?
    public var format: SiriClaw-InstructCameraVideoFormat?
    public var deviceId: String?

    public init(
        facing: SiriClaw-InstructCameraFacing? = nil,
        durationMs: Int? = nil,
        includeAudio: Bool? = nil,
        format: SiriClaw-InstructCameraVideoFormat? = nil,
        deviceId: String? = nil)
    {
        self.facing = facing
        self.durationMs = durationMs
        self.includeAudio = includeAudio
        self.format = format
        self.deviceId = deviceId
    }
}
