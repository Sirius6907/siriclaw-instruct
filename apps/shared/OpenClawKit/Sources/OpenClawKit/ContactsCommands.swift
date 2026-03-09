import Foundation

public enum SiriClaw-InstructContactsCommand: String, Codable, Sendable {
    case search = "contacts.search"
    case add = "contacts.add"
}

public struct SiriClaw-InstructContactsSearchParams: Codable, Sendable, Equatable {
    public var query: String?
    public var limit: Int?

    public init(query: String? = nil, limit: Int? = nil) {
        self.query = query
        self.limit = limit
    }
}

public struct SiriClaw-InstructContactsAddParams: Codable, Sendable, Equatable {
    public var givenName: String?
    public var familyName: String?
    public var organizationName: String?
    public var displayName: String?
    public var phoneNumbers: [String]?
    public var emails: [String]?

    public init(
        givenName: String? = nil,
        familyName: String? = nil,
        organizationName: String? = nil,
        displayName: String? = nil,
        phoneNumbers: [String]? = nil,
        emails: [String]? = nil)
    {
        self.givenName = givenName
        self.familyName = familyName
        self.organizationName = organizationName
        self.displayName = displayName
        self.phoneNumbers = phoneNumbers
        self.emails = emails
    }
}

public struct SiriClaw-InstructContactPayload: Codable, Sendable, Equatable {
    public var identifier: String
    public var displayName: String
    public var givenName: String
    public var familyName: String
    public var organizationName: String
    public var phoneNumbers: [String]
    public var emails: [String]

    public init(
        identifier: String,
        displayName: String,
        givenName: String,
        familyName: String,
        organizationName: String,
        phoneNumbers: [String],
        emails: [String])
    {
        self.identifier = identifier
        self.displayName = displayName
        self.givenName = givenName
        self.familyName = familyName
        self.organizationName = organizationName
        self.phoneNumbers = phoneNumbers
        self.emails = emails
    }
}

public struct SiriClaw-InstructContactsSearchPayload: Codable, Sendable, Equatable {
    public var contacts: [SiriClaw-InstructContactPayload]

    public init(contacts: [SiriClaw-InstructContactPayload]) {
        self.contacts = contacts
    }
}

public struct SiriClaw-InstructContactsAddPayload: Codable, Sendable, Equatable {
    public var contact: SiriClaw-InstructContactPayload

    public init(contact: SiriClaw-InstructContactPayload) {
        self.contact = contact
    }
}
