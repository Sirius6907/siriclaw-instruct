import Testing
@testable import SiriClaw-Instruct

struct HostEnvSanitizerTests {
    @Test func `sanitize blocks shell trace variables`() {
        let env = HostEnvSanitizer.sanitize(overrides: [
            "SHELLOPTS": "xtrace",
            "PS4": "$(touch /tmp/pwned)",
            "SiriClaw-Instruct_TEST": "1",
        ])
        #expect(env["SHELLOPTS"] == nil)
        #expect(env["PS4"] == nil)
        #expect(env["SiriClaw-Instruct_TEST"] == "1")
    }

    @Test func `sanitize shell wrapper allows only explicit override keys`() {
        let env = HostEnvSanitizer.sanitize(
            overrides: [
                "LANG": "C",
                "LC_ALL": "C",
                "SiriClaw-Instruct_TOKEN": "secret",
                "PS4": "$(touch /tmp/pwned)",
            ],
            shellWrapper: true)

        #expect(env["LANG"] == "C")
        #expect(env["LC_ALL"] == "C")
        #expect(env["SiriClaw-Instruct_TOKEN"] == nil)
        #expect(env["PS4"] == nil)
    }

    @Test func `sanitize non shell wrapper keeps regular overrides`() {
        let env = HostEnvSanitizer.sanitize(overrides: ["SiriClaw-Instruct_TOKEN": "secret"])
        #expect(env["SiriClaw-Instruct_TOKEN"] == "secret")
    }
}
