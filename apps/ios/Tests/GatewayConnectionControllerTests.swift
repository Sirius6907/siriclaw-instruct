import SiriClaw-InstructKit
import Foundation
import Testing
import UIKit
@testable import SiriClaw-Instruct

@Suite(.serialized) struct GatewayConnectionControllerTests {
    @Test @MainActor func resolvedDisplayNameSetsDefaultWhenMissing() {
        let defaults = UserDefaults.standard
        let displayKey = "node.displayName"

        withUserDefaults([displayKey: nil, "node.instanceId": "ios-test"]) {
            let appModel = NodeAppModel()
            let controller = GatewayConnectionController(appModel: appModel, startDiscovery: false)

            let resolved = controller._test_resolvedDisplayName(defaults: defaults)
            #expect(!resolved.isEmpty)
            #expect(defaults.string(forKey: displayKey) == resolved)
        }
    }

    @Test @MainActor func currentCapsReflectToggles() {
        withUserDefaults([
            "node.instanceId": "ios-test",
            "node.displayName": "Test Node",
            "camera.enabled": true,
            "location.enabledMode": SiriClaw-InstructLocationMode.always.rawValue,
            VoiceWakePreferences.enabledKey: true,
        ]) {
            let appModel = NodeAppModel()
            let controller = GatewayConnectionController(appModel: appModel, startDiscovery: false)
            let caps = Set(controller._test_currentCaps())

            #expect(caps.contains(SiriClaw-InstructCapability.canvas.rawValue))
            #expect(caps.contains(SiriClaw-InstructCapability.screen.rawValue))
            #expect(caps.contains(SiriClaw-InstructCapability.camera.rawValue))
            #expect(caps.contains(SiriClaw-InstructCapability.location.rawValue))
            #expect(caps.contains(SiriClaw-InstructCapability.voiceWake.rawValue))
        }
    }

    @Test @MainActor func currentCommandsIncludeLocationWhenEnabled() {
        withUserDefaults([
            "node.instanceId": "ios-test",
            "location.enabledMode": SiriClaw-InstructLocationMode.whileUsing.rawValue,
        ]) {
            let appModel = NodeAppModel()
            let controller = GatewayConnectionController(appModel: appModel, startDiscovery: false)
            let commands = Set(controller._test_currentCommands())

            #expect(commands.contains(SiriClaw-InstructLocationCommand.get.rawValue))
        }
    }
    @Test @MainActor func currentCommandsExcludeDangerousSystemExecCommands() {
        withUserDefaults([
            "node.instanceId": "ios-test",
            "camera.enabled": true,
            "location.enabledMode": SiriClaw-InstructLocationMode.whileUsing.rawValue,
        ]) {
            let appModel = NodeAppModel()
            let controller = GatewayConnectionController(appModel: appModel, startDiscovery: false)
            let commands = Set(controller._test_currentCommands())

            // iOS should expose notify, but not host shell/exec-approval commands.
            #expect(commands.contains(SiriClaw-InstructSystemCommand.notify.rawValue))
            #expect(!commands.contains(SiriClaw-InstructSystemCommand.run.rawValue))
            #expect(!commands.contains(SiriClaw-InstructSystemCommand.which.rawValue))
            #expect(!commands.contains(SiriClaw-InstructSystemCommand.execApprovalsGet.rawValue))
            #expect(!commands.contains(SiriClaw-InstructSystemCommand.execApprovalsSet.rawValue))
        }
    }

    @Test @MainActor func loadLastConnectionReadsSavedValues() {
        let prior = KeychainStore.loadString(service: "ai.SiriClaw-Instruct.gateway", account: "lastConnection")
        defer {
            if let prior {
                _ = KeychainStore.saveString(prior, service: "ai.SiriClaw-Instruct.gateway", account: "lastConnection")
            } else {
                _ = KeychainStore.delete(service: "ai.SiriClaw-Instruct.gateway", account: "lastConnection")
            }
        }
        _ = KeychainStore.delete(service: "ai.SiriClaw-Instruct.gateway", account: "lastConnection")

        GatewaySettingsStore.saveLastGatewayConnectionManual(
            host: "gateway.example.com",
            port: 443,
            useTLS: true,
            stableID: "manual|gateway.example.com|443")
        let loaded = GatewaySettingsStore.loadLastGatewayConnection()
        #expect(loaded == .manual(host: "gateway.example.com", port: 443, useTLS: true, stableID: "manual|gateway.example.com|443"))
    }

    @Test @MainActor func loadLastConnectionReturnsNilForInvalidData() {
        let prior = KeychainStore.loadString(service: "ai.SiriClaw-Instruct.gateway", account: "lastConnection")
        defer {
            if let prior {
                _ = KeychainStore.saveString(prior, service: "ai.SiriClaw-Instruct.gateway", account: "lastConnection")
            } else {
                _ = KeychainStore.delete(service: "ai.SiriClaw-Instruct.gateway", account: "lastConnection")
            }
        }
        _ = KeychainStore.delete(service: "ai.SiriClaw-Instruct.gateway", account: "lastConnection")

        // Plant legacy UserDefaults with invalid host/port to exercise migration + validation.
        withUserDefaults([
            "gateway.last.kind": "manual",
            "gateway.last.host": "",
            "gateway.last.port": 0,
            "gateway.last.tls": false,
            "gateway.last.stableID": "manual|invalid|0",
        ]) {
            let loaded = GatewaySettingsStore.loadLastGatewayConnection()
            #expect(loaded == nil)
        }
    }
}
