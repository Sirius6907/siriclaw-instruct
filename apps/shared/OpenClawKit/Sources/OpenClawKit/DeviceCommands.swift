import Foundation

public enum SiriClaw-InstructDeviceCommand: String, Codable, Sendable {
    case status = "device.status"
    case info = "device.info"
}

public enum SiriClaw-InstructBatteryState: String, Codable, Sendable {
    case unknown
    case unplugged
    case charging
    case full
}

public enum SiriClaw-InstructThermalState: String, Codable, Sendable {
    case nominal
    case fair
    case serious
    case critical
}

public enum SiriClaw-InstructNetworkPathStatus: String, Codable, Sendable {
    case satisfied
    case unsatisfied
    case requiresConnection
}

public enum SiriClaw-InstructNetworkInterfaceType: String, Codable, Sendable {
    case wifi
    case cellular
    case wired
    case other
}

public struct SiriClaw-InstructBatteryStatusPayload: Codable, Sendable, Equatable {
    public var level: Double?
    public var state: SiriClaw-InstructBatteryState
    public var lowPowerModeEnabled: Bool

    public init(level: Double?, state: SiriClaw-InstructBatteryState, lowPowerModeEnabled: Bool) {
        self.level = level
        self.state = state
        self.lowPowerModeEnabled = lowPowerModeEnabled
    }
}

public struct SiriClaw-InstructThermalStatusPayload: Codable, Sendable, Equatable {
    public var state: SiriClaw-InstructThermalState

    public init(state: SiriClaw-InstructThermalState) {
        self.state = state
    }
}

public struct SiriClaw-InstructStorageStatusPayload: Codable, Sendable, Equatable {
    public var totalBytes: Int64
    public var freeBytes: Int64
    public var usedBytes: Int64

    public init(totalBytes: Int64, freeBytes: Int64, usedBytes: Int64) {
        self.totalBytes = totalBytes
        self.freeBytes = freeBytes
        self.usedBytes = usedBytes
    }
}

public struct SiriClaw-InstructNetworkStatusPayload: Codable, Sendable, Equatable {
    public var status: SiriClaw-InstructNetworkPathStatus
    public var isExpensive: Bool
    public var isConstrained: Bool
    public var interfaces: [SiriClaw-InstructNetworkInterfaceType]

    public init(
        status: SiriClaw-InstructNetworkPathStatus,
        isExpensive: Bool,
        isConstrained: Bool,
        interfaces: [SiriClaw-InstructNetworkInterfaceType])
    {
        self.status = status
        self.isExpensive = isExpensive
        self.isConstrained = isConstrained
        self.interfaces = interfaces
    }
}

public struct SiriClaw-InstructDeviceStatusPayload: Codable, Sendable, Equatable {
    public var battery: SiriClaw-InstructBatteryStatusPayload
    public var thermal: SiriClaw-InstructThermalStatusPayload
    public var storage: SiriClaw-InstructStorageStatusPayload
    public var network: SiriClaw-InstructNetworkStatusPayload
    public var uptimeSeconds: Double

    public init(
        battery: SiriClaw-InstructBatteryStatusPayload,
        thermal: SiriClaw-InstructThermalStatusPayload,
        storage: SiriClaw-InstructStorageStatusPayload,
        network: SiriClaw-InstructNetworkStatusPayload,
        uptimeSeconds: Double)
    {
        self.battery = battery
        self.thermal = thermal
        self.storage = storage
        self.network = network
        self.uptimeSeconds = uptimeSeconds
    }
}

public struct SiriClaw-InstructDeviceInfoPayload: Codable, Sendable, Equatable {
    public var deviceName: String
    public var modelIdentifier: String
    public var systemName: String
    public var systemVersion: String
    public var appVersion: String
    public var appBuild: String
    public var locale: String

    public init(
        deviceName: String,
        modelIdentifier: String,
        systemName: String,
        systemVersion: String,
        appVersion: String,
        appBuild: String,
        locale: String)
    {
        self.deviceName = deviceName
        self.modelIdentifier = modelIdentifier
        self.systemName = systemName
        self.systemVersion = systemVersion
        self.appVersion = appVersion
        self.appBuild = appBuild
        self.locale = locale
    }
}
