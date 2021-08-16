import { EventEmitter } from "events"
import RTMClient, { Context, SendMessageOptions } from "./RTMClient"
import { SendOption, SoketKey } from "./core/request"
import { RtmMessage } from "./index"
interface ChannelContext extends Context {
    channelId: string
}

interface PreviteRtmProps {
    context: Context
    send: (option: SendOption) => Promise<any>
}

export default class Channel extends EventEmitter {
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

    private send: (option: SendOption) => Promise<any> = () => new Promise((resove, reject) => {})

    constructor(channelId: string, option: PreviteRtmProps) {
        super()
        this.context = { ...option.context, channelId }
        this.send = option.send.bind(RTMClient)
    }

    getMembers(): Promise<string[]> {
        return new Promise(async (resove, reject) => {
            try {
                const result = await this.send({
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
                await this.send({
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
                await this.send({
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
                await this.send({
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
}
