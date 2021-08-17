import RTMClient, { RtmConfig } from "./RTMClient"
import { RtmStatusCode } from "./util/RtmStatusCode"
console.log(`%cwuji-rtm-sdk-version: 1.0.0`, "color:yellow")

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
