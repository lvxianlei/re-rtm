import { Listener } from "events"
import { Context, SendMessageOptions } from "./RTMClient"
import { SoketKey, SocketProps } from "./core/Socket"
import { RtmMessage } from "./RtmMessage"
interface ChannelContext extends Context {
    channelId: string
}

interface PreviteRtmProps {
    context: Context
    request: SocketProps | null
}

export default class Channel {
    private readonly context: ChannelContext = {
        appId: "",
        channelId: "",
        uid: "",
        token: "",
        requestId: 0,
        connectionState: 0,
        config: {
            enableCloudProxy: false,
            enableLogUpload: false,
            logFilter: { error: false, warn: false, info: false, track: false, debug: false }
        }
    }

    private request: SocketProps | null

    constructor(channelId: string, option: PreviteRtmProps) {
        this.context = { ...option.context, channelId }
        this.request = option.request
    }

    getMembers(): Promise<string[]> {
        return new Promise(async (resove, reject) => {
            try {
                const result: any = await this.request?.send({
                    name: SoketKey.GET_CHANNEL_MEMBERS,
                    message: {
                        uri: "GetChannelMembersReq",
                        request_id: this.context.requestId, // 请求ID
                        channel: this.context.channelId // 频道ID
                    }
                })
                resove(result.uids)
            } catch (error) {
                reject(error)
            }
        })
    }

    join(): Promise<void> {
        return new Promise(async (resove, reject) => {
            try {
                await this.request?.send({
                    name: SoketKey.JOIN_CHANNEL,
                    message: {
                        uri: "JoinChannelReq",
                        request_id: this.context.requestId, // 请求ID
                        channel: this.context.channelId // 频道ID
                    }
                })
                resove()
            } catch (error) {
                reject(error)
            }
        })
    }

    leave(): Promise<void> {
        return new Promise(async (resove, reject) => {
            try {
                await this.request?.send({
                    name: SoketKey.LEAVE_CHANNEL,
                    message: {
                        uri: "LeaveChannelReq",
                        request_id: this.context.requestId,
                        // 频道ID
                        channel: this.context.channelId
                    }
                })
                resove()
            } catch (error) {
                reject(error)
            }
        })
    }

    sendMessage(
        message: RtmMessage,
        messageOptions: SendMessageOptions = {
            enableHistoricalMessaging: false,
            enableOfflineMessaging: false
        }
    ): Promise<void> {
        return new Promise(async (resove, reject) => {
            try {
                await this.request?.send({
                    name: SoketKey.SEND_CHANNEL_MESSAGE,
                    message: {
                        uri: "SendChannelMessageReq",
                        request_id: this.context.requestId,
                        // 频道ID
                        channel: this.context.channelId,
                        msg: message // 消息
                    }
                })
                resove()
            } catch (error) {
                reject(error)
            }
        })
    }

    on(eventName: string, listener: Listener) {
        this.request?.on(eventName, listener)
    }
}
