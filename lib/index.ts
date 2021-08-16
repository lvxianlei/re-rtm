import RTMClient from "./RTMClient"
import { RtmStatusCode } from "./util/RtmStatusCode"
console.log(`%cwuji-rtm-sdk-version: 1.0.0`, "color:yellow")
export const RTMclientT = RTMClient
export type LogFilterType = {
    error: boolean
    warn: boolean
    info: boolean
    track: boolean
    debug: boolean
}

export interface RtmConfig {
    enableCloudProxy?: undefined | false | true
    enableLogUpload?: boolean
    logFilter?: LogFilterType
}

export type RtmMessage = RtmTextMessage | RtmRawMessage | RtmFileMessage | RtmImageMessage

export interface RtmTextMessage {
    messageType: "TEXT" | undefined
    text: string
}

export interface RtmRawMessage {
    messageType: "RAW" | undefined
    description: string | undefined
    rawMessage: Uint8Array
}

export interface RtmFileMessage {
    messageType: "FILE" | undefined
    description: string
    fileName: string
    mediaId: string
    size: number
    thumbnail: Blob | undefined
}

export interface RtmImageMessage {
    messageType: "IMAGE" | undefined
    description: string
    fileName: string
    width: number
    height: number
    mediaId: string
    size: number
    thumbnail: Blob | undefined
    thumbnailHeight: number
    thumbnailWidth: number
}

export enum MESSAGE_TYPE {
    /**
    1: A text message.
    */
    TEXT = 1,

    /**
    2: A raw message. A raw message is a binary message whose size does not exceed
    32 KB.
    */
    RAW = 2,

    /**
     3: A file message. The size of a file message must be less than 32 KB.
     */
    FILE = 3,

    /**
     4: An image message. The size of an image message must be less than 32 KB.
     */
    IMAGE = 4
}

export type ConnectionChangeReason = RtmStatusCode.ConnectionChangeReason
export type ConnectionState = RtmStatusCode.ConnectionState
export type LocalInvitationFailureReason = RtmStatusCode.LocalInvitationFailureReason
export type LocalInvitationState = RtmStatusCode.LocalInvitationState
export type RemoteInvitationState = RtmStatusCode.RemoteInvitationState
export type RemoteInvitationFailureReason = RtmStatusCode.RemoteInvitationFailureReason
export type PeerOnlineState = RtmStatusCode.PeerOnlineState
export type PeerSubscriptionOption = RtmStatusCode.PeerSubscriptionOption

export const END_CALL_PREFIX: string = "WujiRTMLegacyEndcallCompatibleMessagePrefix"

export function createInstance(
    appId: string,
    config: RtmConfig = {
        enableCloudProxy: false,
        enableLogUpload: false,
        logFilter: { error: false, warn: false, info: false, track: false, debug: false }
    },
    areaCodes?: RtmStatusCode.AreaCode[]
): RTMClient {
    console.log("wuji:", new RTMClient("123", config))
    return new RTMClient(appId, config)
}
