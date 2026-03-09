// swift-tools-version: 6.2

import PackageDescription

let package = Package(
    name: "SiriClaw-InstructKit",
    platforms: [
        .iOS(.v18),
        .macOS(.v15),
    ],
    products: [
        .library(name: "SiriClaw-InstructProtocol", targets: ["SiriClaw-InstructProtocol"]),
        .library(name: "SiriClaw-InstructKit", targets: ["SiriClaw-InstructKit"]),
        .library(name: "SiriClaw-InstructChatUI", targets: ["SiriClaw-InstructChatUI"]),
    ],
    dependencies: [
        .package(url: "https://github.com/steipete/ElevenLabsKit", exact: "0.1.0"),
        .package(url: "https://github.com/gonzalezreal/textual", exact: "0.3.1"),
    ],
    targets: [
        .target(
            name: "SiriClaw-InstructProtocol",
            path: "Sources/SiriClaw-InstructProtocol",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .target(
            name: "SiriClaw-InstructKit",
            dependencies: [
                "SiriClaw-InstructProtocol",
                .product(name: "ElevenLabsKit", package: "ElevenLabsKit"),
            ],
            path: "Sources/SiriClaw-InstructKit",
            resources: [
                .process("Resources"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .target(
            name: "SiriClaw-InstructChatUI",
            dependencies: [
                "SiriClaw-InstructKit",
                .product(
                    name: "Textual",
                    package: "textual",
                    condition: .when(platforms: [.macOS, .iOS])),
            ],
            path: "Sources/SiriClaw-InstructChatUI",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .testTarget(
            name: "SiriClaw-InstructKitTests",
            dependencies: ["SiriClaw-InstructKit", "SiriClaw-InstructChatUI"],
            path: "Tests/SiriClaw-InstructKitTests",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
                .enableExperimentalFeature("SwiftTesting"),
            ]),
    ])
