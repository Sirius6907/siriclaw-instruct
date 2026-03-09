// swift-tools-version: 6.2
// Package manifest for the SiriClaw-Instruct macOS companion (menu bar app + IPC library).

import PackageDescription

let package = Package(
    name: "SiriClaw-Instruct",
    platforms: [
        .macOS(.v15),
    ],
    products: [
        .library(name: "SiriClaw-InstructIPC", targets: ["SiriClaw-InstructIPC"]),
        .library(name: "SiriClaw-InstructDiscovery", targets: ["SiriClaw-InstructDiscovery"]),
        .executable(name: "SiriClaw-Instruct", targets: ["SiriClaw-Instruct"]),
        .executable(name: "SiriClaw-Instruct-mac", targets: ["SiriClaw-InstructMacCLI"]),
    ],
    dependencies: [
        .package(url: "https://github.com/orchetect/MenuBarExtraAccess", exact: "1.2.2"),
        .package(url: "https://github.com/swiftlang/swift-subprocess.git", from: "0.1.0"),
        .package(url: "https://github.com/apple/swift-log.git", from: "1.8.0"),
        .package(url: "https://github.com/sparkle-project/Sparkle", from: "2.8.1"),
        .package(url: "https://github.com/steipete/Peekaboo.git", branch: "main"),
        .package(path: "../shared/SiriClaw-InstructKit"),
        .package(path: "../../Swabble"),
    ],
    targets: [
        .target(
            name: "SiriClaw-InstructIPC",
            dependencies: [],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .target(
            name: "SiriClaw-InstructDiscovery",
            dependencies: [
                .product(name: "SiriClaw-InstructKit", package: "SiriClaw-InstructKit"),
            ],
            path: "Sources/SiriClaw-InstructDiscovery",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .executableTarget(
            name: "SiriClaw-Instruct",
            dependencies: [
                "SiriClaw-InstructIPC",
                "SiriClaw-InstructDiscovery",
                .product(name: "SiriClaw-InstructKit", package: "SiriClaw-InstructKit"),
                .product(name: "SiriClaw-InstructChatUI", package: "SiriClaw-InstructKit"),
                .product(name: "SiriClaw-InstructProtocol", package: "SiriClaw-InstructKit"),
                .product(name: "SwabbleKit", package: "swabble"),
                .product(name: "MenuBarExtraAccess", package: "MenuBarExtraAccess"),
                .product(name: "Subprocess", package: "swift-subprocess"),
                .product(name: "Logging", package: "swift-log"),
                .product(name: "Sparkle", package: "Sparkle"),
                .product(name: "PeekabooBridge", package: "Peekaboo"),
                .product(name: "PeekabooAutomationKit", package: "Peekaboo"),
            ],
            exclude: [
                "Resources/Info.plist",
            ],
            resources: [
                .copy("Resources/SiriClaw-Instruct.icns"),
                .copy("Resources/DeviceModels"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .executableTarget(
            name: "SiriClaw-InstructMacCLI",
            dependencies: [
                "SiriClaw-InstructDiscovery",
                .product(name: "SiriClaw-InstructKit", package: "SiriClaw-InstructKit"),
                .product(name: "SiriClaw-InstructProtocol", package: "SiriClaw-InstructKit"),
            ],
            path: "Sources/SiriClaw-InstructMacCLI",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .testTarget(
            name: "SiriClaw-InstructIPCTests",
            dependencies: [
                "SiriClaw-InstructIPC",
                "SiriClaw-Instruct",
                "SiriClaw-InstructDiscovery",
                .product(name: "SiriClaw-InstructProtocol", package: "SiriClaw-InstructKit"),
                .product(name: "SwabbleKit", package: "swabble"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
                .enableExperimentalFeature("SwiftTesting"),
            ]),
    ])
