import CoreLocation
import Foundation
import SiriClaw-InstructKit
import UIKit

typealias SiriClaw-InstructCameraSnapResult = (format: String, base64: String, width: Int, height: Int)
typealias SiriClaw-InstructCameraClipResult = (format: String, base64: String, durationMs: Int, hasAudio: Bool)

protocol CameraServicing: Sendable {
    func listDevices() async -> [CameraController.CameraDeviceInfo]
    func snap(params: SiriClaw-InstructCameraSnapParams) async throws -> SiriClaw-InstructCameraSnapResult
    func clip(params: SiriClaw-InstructCameraClipParams) async throws -> SiriClaw-InstructCameraClipResult
}

protocol ScreenRecordingServicing: Sendable {
    func record(
        screenIndex: Int?,
        durationMs: Int?,
        fps: Double?,
        includeAudio: Bool?,
        outPath: String?) async throws -> String
}

@MainActor
protocol LocationServicing: Sendable {
    func authorizationStatus() -> CLAuthorizationStatus
    func accuracyAuthorization() -> CLAccuracyAuthorization
    func ensureAuthorization(mode: SiriClaw-InstructLocationMode) async -> CLAuthorizationStatus
    func currentLocation(
        params: SiriClaw-InstructLocationGetParams,
        desiredAccuracy: SiriClaw-InstructLocationAccuracy,
        maxAgeMs: Int?,
        timeoutMs: Int?) async throws -> CLLocation
    func startLocationUpdates(
        desiredAccuracy: SiriClaw-InstructLocationAccuracy,
        significantChangesOnly: Bool) -> AsyncStream<CLLocation>
    func stopLocationUpdates()
    func startMonitoringSignificantLocationChanges(onUpdate: @escaping @Sendable (CLLocation) -> Void)
    func stopMonitoringSignificantLocationChanges()
}

@MainActor
protocol DeviceStatusServicing: Sendable {
    func status() async throws -> SiriClaw-InstructDeviceStatusPayload
    func info() -> SiriClaw-InstructDeviceInfoPayload
}

protocol PhotosServicing: Sendable {
    func latest(params: SiriClaw-InstructPhotosLatestParams) async throws -> SiriClaw-InstructPhotosLatestPayload
}

protocol ContactsServicing: Sendable {
    func search(params: SiriClaw-InstructContactsSearchParams) async throws -> SiriClaw-InstructContactsSearchPayload
    func add(params: SiriClaw-InstructContactsAddParams) async throws -> SiriClaw-InstructContactsAddPayload
}

protocol CalendarServicing: Sendable {
    func events(params: SiriClaw-InstructCalendarEventsParams) async throws -> SiriClaw-InstructCalendarEventsPayload
    func add(params: SiriClaw-InstructCalendarAddParams) async throws -> SiriClaw-InstructCalendarAddPayload
}

protocol RemindersServicing: Sendable {
    func list(params: SiriClaw-InstructRemindersListParams) async throws -> SiriClaw-InstructRemindersListPayload
    func add(params: SiriClaw-InstructRemindersAddParams) async throws -> SiriClaw-InstructRemindersAddPayload
}

protocol MotionServicing: Sendable {
    func activities(params: SiriClaw-InstructMotionActivityParams) async throws -> SiriClaw-InstructMotionActivityPayload
    func pedometer(params: SiriClaw-InstructPedometerParams) async throws -> SiriClaw-InstructPedometerPayload
}

struct WatchMessagingStatus: Sendable, Equatable {
    var supported: Bool
    var paired: Bool
    var appInstalled: Bool
    var reachable: Bool
    var activationState: String
}

struct WatchQuickReplyEvent: Sendable, Equatable {
    var replyId: String
    var promptId: String
    var actionId: String
    var actionLabel: String?
    var sessionKey: String?
    var note: String?
    var sentAtMs: Int?
    var transport: String
}

struct WatchNotificationSendResult: Sendable, Equatable {
    var deliveredImmediately: Bool
    var queuedForDelivery: Bool
    var transport: String
}

protocol WatchMessagingServicing: AnyObject, Sendable {
    func status() async -> WatchMessagingStatus
    func setReplyHandler(_ handler: (@Sendable (WatchQuickReplyEvent) -> Void)?)
    func sendNotification(
        id: String,
        params: SiriClaw-InstructWatchNotifyParams) async throws -> WatchNotificationSendResult
}

extension CameraController: CameraServicing {}
extension ScreenRecordService: ScreenRecordingServicing {}
extension LocationService: LocationServicing {}
