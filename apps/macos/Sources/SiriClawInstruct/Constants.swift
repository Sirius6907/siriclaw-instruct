import Foundation

// Stable identifier used for both the macOS LaunchAgent label and Nix-managed defaults suite.
// nix-SiriClaw-Instruct writes app defaults into this suite to survive app bundle identifier churn.
let launchdLabel = "ai.SiriClaw-Instruct.mac"
let gatewayLaunchdLabel = "ai.SiriClaw-Instruct.gateway"
let onboardingVersionKey = "SiriClaw-Instruct.onboardingVersion"
let onboardingSeenKey = "SiriClaw-Instruct.onboardingSeen"
let currentOnboardingVersion = 7
let pauseDefaultsKey = "SiriClaw-Instruct.pauseEnabled"
let iconAnimationsEnabledKey = "SiriClaw-Instruct.iconAnimationsEnabled"
let swabbleEnabledKey = "SiriClaw-Instruct.swabbleEnabled"
let swabbleTriggersKey = "SiriClaw-Instruct.swabbleTriggers"
let voiceWakeTriggerChimeKey = "SiriClaw-Instruct.voiceWakeTriggerChime"
let voiceWakeSendChimeKey = "SiriClaw-Instruct.voiceWakeSendChime"
let showDockIconKey = "SiriClaw-Instruct.showDockIcon"
let defaultVoiceWakeTriggers = ["SiriClaw-Instruct"]
let voiceWakeMaxWords = 32
let voiceWakeMaxWordLength = 64
let voiceWakeMicKey = "SiriClaw-Instruct.voiceWakeMicID"
let voiceWakeMicNameKey = "SiriClaw-Instruct.voiceWakeMicName"
let voiceWakeLocaleKey = "SiriClaw-Instruct.voiceWakeLocaleID"
let voiceWakeAdditionalLocalesKey = "SiriClaw-Instruct.voiceWakeAdditionalLocaleIDs"
let voicePushToTalkEnabledKey = "SiriClaw-Instruct.voicePushToTalkEnabled"
let talkEnabledKey = "SiriClaw-Instruct.talkEnabled"
let iconOverrideKey = "SiriClaw-Instruct.iconOverride"
let connectionModeKey = "SiriClaw-Instruct.connectionMode"
let remoteTargetKey = "SiriClaw-Instruct.remoteTarget"
let remoteIdentityKey = "SiriClaw-Instruct.remoteIdentity"
let remoteProjectRootKey = "SiriClaw-Instruct.remoteProjectRoot"
let remoteCliPathKey = "SiriClaw-Instruct.remoteCliPath"
let canvasEnabledKey = "SiriClaw-Instruct.canvasEnabled"
let cameraEnabledKey = "SiriClaw-Instruct.cameraEnabled"
let systemRunPolicyKey = "SiriClaw-Instruct.systemRunPolicy"
let systemRunAllowlistKey = "SiriClaw-Instruct.systemRunAllowlist"
let systemRunEnabledKey = "SiriClaw-Instruct.systemRunEnabled"
let locationModeKey = "SiriClaw-Instruct.locationMode"
let locationPreciseKey = "SiriClaw-Instruct.locationPreciseEnabled"
let peekabooBridgeEnabledKey = "SiriClaw-Instruct.peekabooBridgeEnabled"
let deepLinkKeyKey = "SiriClaw-Instruct.deepLinkKey"
let modelCatalogPathKey = "SiriClaw-Instruct.modelCatalogPath"
let modelCatalogReloadKey = "SiriClaw-Instruct.modelCatalogReload"
let cliInstallPromptedVersionKey = "SiriClaw-Instruct.cliInstallPromptedVersion"
let heartbeatsEnabledKey = "SiriClaw-Instruct.heartbeatsEnabled"
let debugPaneEnabledKey = "SiriClaw-Instruct.debugPaneEnabled"
let debugFileLogEnabledKey = "SiriClaw-Instruct.debug.fileLogEnabled"
let appLogLevelKey = "SiriClaw-Instruct.debug.appLogLevel"
let voiceWakeSupported: Bool = ProcessInfo.processInfo.operatingSystemVersion.majorVersion >= 26
