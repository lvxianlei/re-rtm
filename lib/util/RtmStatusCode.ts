export namespace RtmStatusCode {

    export enum ConnectionChangeReason {
        LOGIN = "LOGIN",
        LOGIN_SUCCESS = "LOGIN_SUCCESS",
        LOGIN_FAILURE = "LOGIN_FAILURE",
        LOGIN_TIMEOUT = "LOGIN_TIMEOUT",
        INTERRUPTED = "INTERRUPTED",
        LOGOUT = "LOGOUT",
        BANNED_BY_SERVER = "BANNED_BY_SERVER",
        REMOTE_LOGIN = "REMOTE_LOGIN"
    }

    export enum ConnectionState {
        DISCONNECTED = "DISCONNECTED",
        CONNECTING = "CONNECTING",
        CONNECTED = "CONNECTED",
        RECONNECTING = "RECONNECTING",
        ABORTED = "ABORTED"
    }

    export enum LocalInvitationState {
        IDLE = "IDLE",
        SENT_TO_REMOTE = "SENT_TO_REMOTE",
        RECEIVED_BY_REMOTE = "RECEIVED_BY_REMOTE",
        ACCEPTED_BY_REMOTE = "ACCEPTED_BY_REMOTE",
        REFUSED_BY_REMOTE = "REFUSED_BY_REMOTE",
        CANCELED = "CANCELED",
        FAILURE = "FAILURE"
    }

    export enum RemoteInvitationState {
        IDLE = "IDLE",
        INVITATION_RECEIVED = "INVITATION_RECEIVED",
        ACCEPT_SENT_TO_LOCAL = "ACCEPT_SENT_TO_LOCAL",
        REFUSED = "REFUSED",
        ACCEPTED = "ACCEPTED",
        CANCELED = "CANCELED",
        FAILURE = "FAILURE"
    }

    export enum LocalInvitationFailureReason {
        UNKNOWN = "UNKNOWN",
        PEER_NO_RESPONSE = "PEER_NO_RESPONSE",
        INVITATION_EXPIRE = "INVITATION_EXPIRE",
        PEER_OFFLINE = "PEER_OFFLINE",
        NOT_LOGGEDIN = "NOT_LOGGEDIN"
    }

    export enum RemoteInvitationFailureReason {
        UNKNOWN = "UNKNOWN",
        PEER_OFFLINE = "PEER_OFFLINE",
        ACCEPT_FAILURE = "ACCEPT_FAILURE",
        INVITATION_EXPIRE = "INVITATION_EXPIRE"
    }

    export enum PeerOnlineState {
        ONLINE = "ONLINE",
        UNREACHABLE = "UNREACHABLE",
        OFFLINE = "OFFLINE"
    }

    export enum PeerSubscriptionOption {
        ONLINE_STATUS = "ONLINE_STATUS"
    }

    export enum MessageType {
        TEXT = "TEXT",
        RAW = "RAW",
        IMAGE = "IMAGE",
        FILE = "FILE"
    }

    export enum AreaCode {
        CN = "CN",
        NA = "NA",
        EU = "EU",
        AS = "AS",
        JP = "JP",
        IN = "IN",
        GLOB = "GLOB",
        OC = "OC",
        SA = "SA",
        AF = "AF",
        OVS = "OVS",
    }
}
