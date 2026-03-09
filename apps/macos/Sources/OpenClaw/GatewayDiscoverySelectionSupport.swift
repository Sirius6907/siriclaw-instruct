import SiriClaw-InstructDiscovery

@MainActor
enum GatewayDiscoverySelectionSupport {
    static func applyRemoteSelection(
        gateway: GatewayDiscoveryModel.DiscoveredGateway,
        state: AppState)
    {
        if state.remoteTransport == .direct {
            state.remoteUrl = GatewayDiscoveryHelpers.directUrl(for: gateway) ?? ""
        } else {
            state.remoteTarget = GatewayDiscoveryHelpers.sshTarget(for: gateway) ?? ""
        }
        if let endpoint = GatewayDiscoveryHelpers.serviceEndpoint(for: gateway) {
            SiriClaw-InstructConfigFile.setRemoteGatewayUrl(
                host: endpoint.host,
                port: endpoint.port)
        } else {
            SiriClaw-InstructConfigFile.clearRemoteGatewayUrl()
        }
    }
}
