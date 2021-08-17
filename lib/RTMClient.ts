import Socket, { SoketKey, SocketProps } from "./core/Socket"
import Channel from "./Channel"
import { Listener } from "events"
import LocalInvitation from "./LocalInvitation"
import { BaseURL, protocols } from "./config"
import { get_msg_id } from "./RtmUtil"
import { RtmTextMessage, RtmMessage, MESSAGE_TYPE, RtmRawMessage } from "./RtmMessage"
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

export interface login {
    uid: string
    token?: undefined | string
}

export interface Context {
    appId: string
    uid: string
    connectionState: number
    token: string | undefined
    requestId: number
    config: RtmConfig
}

export interface PeersOnlineStatusResult {
    [peerId: string]: boolean
}

export interface SendMessageOptions {
    enableHistoricalMessaging: boolean | undefined
    enableOfflineMessaging: boolean | undefined
}

export enum PeerSubscriptionOption {
    ONLINE_STATUS = "ONLINE_STATUS"
}

export interface AttributesMap {
    [key: string]: string
}

export interface ChannelAttributeOptions {
    //是否通知所有频道成员本次频道属性变更。该标志位仅对本次 API 调用有效 默认false
    enableNotificationToChannelMembers: boolean | undefined
}

export interface ChannelAttributes {
    [key: string]: {
        lastUpdateTs: number
        lastUpdateUserId: string
        value: string //8k
    }
}

export interface ChannelMemberCountResult {
    [channelId: string]: number
}

export interface MediaTransferHandler {
    cancelSignal: AbortSignal
    onOperationProgress?: () => {}
}

export default class RTMClient {
    private readonly context: Context = {
        appId: "",
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
    private test_request: SocketProps | null = null
    constructor(appId: string, config: RtmConfig) {
        // super(BaseURL, protocols)
        this.test_request = Socket(BaseURL, protocols)
        this.context.appId = appId
        this.context.requestId = ++this.context.requestId
        this.context.config = config
    }

    login(option: login): Promise<void> {
        return new Promise(async (resove, reject) => {
            this.context.uid = option.uid
            this.context.token = option.token
            try {
                await this.test_request?.open({ request_id: this.context.requestId })
                await this.test_request?.send({
                    name: SoketKey.LOGIN,
                    message: {
                        uri: "LoginReq",
                        appid: this.context.appId,
                        uid: option.uid,
                        request_id: this.context.requestId,
                        token: option.token || ""
                    }
                })
                resove()
            } catch (error) {
                reject(error)
            }
        })
    }

    logout(): Promise<void> {
        return new Promise(async (resove, reject) => {
            resove()
        })
    }

    sendMessageToPeer(
        message: RtmMessage,
        peerId: string,
        option: SendMessageOptions | undefined = {
            enableHistoricalMessaging: false,
            enableOfflineMessaging: false
        }
    ): Promise<any> {
        return new Promise(async (resove, reject) => {
            let msg: { id: number; type: number } = { id: get_msg_id(), type: 0 }
            let msg_type: string = "text"
            let req_msg: Object = {}
            if (message.messageType) {
                msg.type = MESSAGE_TYPE[message.messageType.toLocaleUpperCase()]
                delete message.messageType
                message = message as RtmMessage
            }

            if (Object.keys(message).includes("text")) {
                msg.type = MESSAGE_TYPE.TEXT
                message = message as RtmTextMessage
            }

            if (Object.keys(message).includes("rawMessage")) {
                msg_type = "raw"
                msg.type = MESSAGE_TYPE.RAW
                message = message as RtmRawMessage
            }

            if (message.messageType === "IMAGE") {
                msg_type = "image"
            }

            if (message.messageType === "FILE") {
                msg_type = "file"
            }

            if ([1, 2].includes(msg.type)) {
                req_msg = message
            } else {
                req_msg = { [msg_type]: { ...message } }
            }

            try {
                const result = await this.test_request?.send({
                    name: SoketKey.SEND_MESSAGE,
                    message: {
                        uri: "SendMessageReq",
                        request_id: this.context.requestId,
                        // 接收者uid
                        receiver: peerId,
                        // true:对方离线时保存消息，待上线时推送离线消息；false:对方离线时丢弃消息，默认false
                        offline: option.enableOfflineMessaging,
                        // true:保存为历史消息，restful api可读取；false:不保存消息，默认false
                        historical: option.enableHistoricalMessaging,
                        // 消息
                        msg: { ...msg, ...req_msg }
                    }
                })
                resove(result)
            } catch (error) {
                reject(error)
            }
        })
    }
    //Promise<PeersOnlineStatusResult>
    queryPeersOnlineStatus(peerIds: string[]): Promise<any> {
        return new Promise(async (resove, reject) => {
            try {
                const result = await this.test_request?.send({
                    name: SoketKey.QUERYPEERS_ONLINE_STATUS,
                    message: {
                        uri: "GetOnlineStatusReq",
                        request_id: this.context.requestId,
                        uids: peerIds // uid数组
                    }
                })
                resove(result)
            } catch (error) {
                reject(error)
            }
        })
    }

    //用户状态
    subscribePeersOnlineStatus(peerIds: string[]): Promise<void> {
        return new Promise(async (resove, reject) => {
            try {
                await this.test_request?.send({
                    name: SoketKey.SUBSCRIBE_ONLINE_STATUS,
                    message: {
                        uri: "SubscribeOnlineStatusReq",
                        request_id: this.context.requestId,
                        uids: peerIds
                    }
                })
                resove()
            } catch (error) {
                reject(error)
            }
        })
    }

    unsubscribePeersOnlineStatus(peerIds: string[]): Promise<void> {
        return new Promise(async (resove, reject) => {
            try {
                await this.test_request?.send({
                    name: SoketKey.UNSUBSCRIBE_ONLINE_STATUS,
                    message: {
                        uri: "UnSubscribeOnlineStatusReq",
                        request_id: this.context.requestId,
                        // 取消订阅uid数组
                        uids: peerIds
                    }
                })
                resove()
            } catch (error) {
                reject(error)
            }
        })
    }
    //获取某特定内容被订阅的用户列表
    queryPeersBySubscriptionOption(option: PeerSubscriptionOption): Promise<any> {
        return new Promise(async (resove, reject) => {
            try {
                const result = await this.test_request?.send({
                    name: SoketKey.GET_SUBSCRIBE_ONLINE_STATUS_UIDS,
                    message: {
                        uri: "GetSubscribeOnlineStatusUidsReq",
                        request_id: this.context.requestId
                    }
                })
                resove(result)
            } catch (error) {
                reject(error)
            }
        })
    }

    //用户属性
    setLocalUserAttributes(attributes: AttributesMap): Promise<void> {
        return new Promise(async (resove, reject) => {
            try {
                await this.test_request?.send({
                    name: SoketKey.SET_USER_ATTRS,
                    message: {
                        uri: "SetUserAttrsReq",
                        request_id: this.context.requestId,
                        attributes: attributes // 改动的属性kv
                    }
                })
                resove()
            } catch (error) {
                reject(error)
            }
        })
    }
    // ---------  暂时同上，无法区分新增和设置  ---- 待修改（ps：存在应该前端保存已设置或后端保存的疑问）
    addOrUpdateLocalUserAttributes(attributes: AttributesMap): Promise<void> {
        return new Promise(async (resove, reject) => {
            try {
                await this.test_request?.send({
                    name: SoketKey.SET_USER_ATTRS,
                    message: {
                        uri: "SetUserAttrsReq",
                        request_id: this.context.requestId,
                        attributes: attributes // 改动的属性kv
                    }
                })
                resove()
            } catch (error) {
                reject(error)
            }
        })
    }

    deleteLocalUserAttributesByKeys(attributeKeys: string[]): Promise<void> {
        return new Promise(async (resove, reject) => {
            try {
                await this.test_request?.send({
                    name: SoketKey.DELETE_USER_ATTRS,
                    message: {
                        uri: "DelUserAttrsReq",
                        request_id: this.context.requestId,
                        attribute_keys: attributeKeys // 删除的属性key
                    }
                })
                resove()
            } catch (error) {
                reject(error)
            }
        })
    }
    //  --------attribute_keys存在疑问
    clearLocalUserAttributes(): Promise<void> {
        return new Promise(async (resove, reject) => {
            try {
                await this.test_request?.send({
                    name: SoketKey.CLEAR_LOCAL_USER_ATTRS,
                    message: {
                        uri: "DelUserAllAttrsReq",
                        request_id: this.context.requestId,
                        attribute_keys: [] // 删除的属性key
                    }
                })
                resove()
            } catch (error) {
                reject(error)
            }
        })
    }

    getUserAttributes(userId: string): Promise<any> {
        return new Promise(async (resove, reject) => {
            try {
                const result: any = await this.test_request?.send({
                    name: SoketKey.GET_USER_ATTRIBUTES,
                    message: {
                        uri: "GetUserAttrsReq",
                        request_id: this.context.requestId,
                        uid: userId // 指定用户
                    }
                })
                resove(result.attributes)
            } catch (error) {
                reject(error)
            }
        })
    }

    getUserAttributesByKeys(userId: string, attributeKeys: string[]): Promise<AttributesMap> {
        return new Promise(async (resove, reject) => {
            try {
                let attrs: AttributesMap = {}
                const result: any = await this.test_request?.send({
                    name: SoketKey.GET_USER_ATTRIBUTES,
                    message: {
                        uri: "GetUserAttrsReq",
                        request_id: this.context.requestId,
                        uid: userId // 指定用户
                    }
                })
                attributeKeys.forEach(item => (attrs[item] = result.attributes[item]))
                resove(attrs)
            } catch (error) {
                reject(error)
            }
        })
    }

    //频道属性
    setChannelAttributes(
        channelId: string,
        attributes: AttributesMap,
        options: ChannelAttributeOptions | undefined = {
            enableNotificationToChannelMembers: false
        }
    ): Promise<void> {
        return new Promise(async (resove, reject) => {
            try {
                await this.test_request?.send({
                    name: SoketKey.SET_CHANNEL_ATTRS,
                    message: {
                        uri: "SetChannelAttrsReq",
                        request_id: this.context.requestId,
                        channel: channelId, // 频道ID
                        notify: options.enableNotificationToChannelMembers, // 是否通知所有频道成员，默认false
                        attributes: attributes // 改动的属性kv
                    }
                })
                resove()
            } catch (error) {
                reject(error)
            }
        })
    }
    // 暂未区分添加，暂和setChannelAttributes功能相同。。。（ps：存在应该前端保存已设置或后端保存的疑问）
    addOrUpdateChannelAttributes(
        channelId: string,
        attributes: AttributesMap,
        options: ChannelAttributeOptions | undefined = {
            enableNotificationToChannelMembers: false
        }
    ): Promise<void> {
        return new Promise(async (resove, reject) => {
            try {
                await this.test_request?.send({
                    name: SoketKey.SET_CHANNEL_ATTRS,
                    message: {
                        uri: "SetChannelAttrsReq",
                        request_id: this.context.requestId,
                        channel: channelId, // 频道ID
                        notify: options.enableNotificationToChannelMembers, // 是否通知所有频道成员，默认false
                        attributes: attributes // 改动的属性kv
                    }
                })
                resove()
            } catch (error) {
                reject(error)
            }
        })
    }

    deleteChannelAttributesByKeys(
        channelId: string,
        attributeKeys: string[],
        options: ChannelAttributeOptions = {
            enableNotificationToChannelMembers: false
        }
    ): Promise<void> {
        return new Promise(async (resove, reject) => {
            try {
                await this.test_request?.send({
                    name: SoketKey.DELETE_CHANNEL_ATTRIBUTES,
                    message: {
                        uri: "DelChannelAttrsReq",
                        request_id: this.context.requestId,
                        channel: channelId, // 频道ID
                        notify: options.enableNotificationToChannelMembers, // 是否通知所有频道成员，默认false
                        attribute_keys: attributeKeys // 删除的属性key
                    }
                })
                resove()
            } catch (error) {
                reject(error)
            }
        })
    }

    clearChannelAttributes(
        channelId: string,
        options: ChannelAttributeOptions = {
            enableNotificationToChannelMembers: false
        }
    ): Promise<void> {
        return new Promise(async (resove, reject) => {
            try {
                await this.test_request?.send({
                    name: SoketKey.CLEAR_CHANNEL_ATTRIBUTES,
                    message: {
                        uri: "DelChannelAllAttrsReq",
                        request_id: this.context.requestId,
                        channel: channelId, // 频道ID
                        notify: options.enableNotificationToChannelMembers // 是否通知所有频道成员，默认false
                    }
                })
                resove()
            } catch (error) {
                reject(error)
            }
        })
    }

    getChannelAttributes(channelId: string): Promise<ChannelAttributes> {
        return new Promise(async (resove, reject) => {
            try {
                const result: any = await this.test_request?.send({
                    name: SoketKey.GET_CHANNEL_ATTRIBUTES,
                    message: {
                        uri: "GetChannelAttrsReq",
                        request_id: this.context.requestId,
                        channel: channelId // 频道ID
                    }
                })
                let attrs: ChannelAttributes = {}
                result.attributes.forEach(
                    (item: any) =>
                        (attrs[item.value] = {
                            lastUpdateTs: item.ts,
                            lastUpdateUserId: item.uid,
                            value: item.value
                        })
                )
                resove(attrs)
            } catch (error) {
                reject(error)
            }
        })
    }

    getChannelAttributesByKeys(channelId: string, keys: string[]): Promise<ChannelAttributes> {
        return new Promise(async (resove, reject) => {
            try {
                const result: any = await this.test_request?.send({
                    name: SoketKey.GET_CHANNEL_ATTRIBUTES,
                    message: {
                        uri: "GetChannelAttrsReq",
                        request_id: this.context.requestId,
                        channel: channelId // 频道ID
                    }
                })
                let attrs: ChannelAttributes = {}
                result.attributes
                    .filter((fItem: any) => keys.includes(fItem.key))
                    .forEach(
                        (item: any) =>
                            (attrs[item.value] = {
                                lastUpdateTs: item.ts,
                                lastUpdateUserId: item.uid,
                                value: item.value
                            })
                    )
                resove(attrs)
            } catch (error) {
                reject(error)
            }
        })
    }

    //查询成员人数
    getChannelMemberCount(channelIds: string[]): Promise<ChannelMemberCountResult> {
        return new Promise(async (resove, reject) => {
            try {
                // {
                //     channels: string[],
                //     counts: number[],
                //     request_id: number,
                //     uri: SoketKey.GET_CHANNEL_MEMBERS_COUNTS
                // }
                const result: any = await this.test_request?.send({
                    name: SoketKey.GET_CHANNEL_MEMBERS_COUNTS,
                    message: {
                        uri: "GetChannelMemberCountsReq",
                        request_id: this.context.requestId, // 请求ID
                        channels: channelIds // 查询的频道数组
                    }
                })
                let channelMemberCountResult: ChannelMemberCountResult = {}
                result.channels.forEach(
                    (item: string, index: number) => (channelMemberCountResult[item] = result.counts[index])
                )
                resove(channelMemberCountResult)
            } catch (error) {
                reject(error)
            }
        })
    }

    //图片
    createMediaMessageByUploading(
        payload: Blob,
        params?: undefined | object
        // transHandler?: MediaTransferHandler
    ): Promise<void> {
        return new Promise(async (resove, reject) => {
            try {
                resove()
            } catch (error) {
                reject(error)
            }
        })
    }
    //  未重新更改。。 为原版拷贝
    createMessage<T extends RtmMessage>(message: Partial<T>): T {
        let msg: any = { ...message }
        if (msg.hasOwnProperty("text")) {
            const textMessage = {
                text: msg.text,
                messageType: "TEXT"
            }
            return textMessage as T
        } else if (msg.hasOwnProperty("rawMessage")) {
            const rawMessage = {
                rawMessage: msg.rawMessage,
                messageType: "RAW"
            }
            return rawMessage as T
        } else if (msg.hasOwnProperty("messageType")) {
            if (msg.messageType == "IMAGE") {
                const imageMessage = {
                    width: msg.width ? msg.width : 0,
                    height: msg.height ? msg.height : 0,
                    fileName: msg.fileName ? msg.fileName + "" : "",
                    description: msg.description ? msg.description + "" : "",
                    thumbnail: msg.thumbnail,
                    thumbnailWidth: msg.thumbnailWidth ? msg.thumbnailWidth : 0,
                    thumbnailHeight: msg.thumbnailHeight ? msg.thumbnailHeight : 0,
                    size: msg.size ? msg.size : 0,
                    mediaId: msg.mediaId ? msg.mediaId + "" : "",
                    messageType: "IMAGE"
                }
                return imageMessage as T
            } else if (msg.messageType == "FILE") {
                const fileMessage = {
                    fileName: msg.fileName ? msg.fileName + "" : "",
                    description: msg.description ? msg.description + "" : "",
                    thumbnail: msg.thumbnail,
                    size: msg.size ? msg.size : 0,
                    mediaId: msg.mediaId ? msg.mediaId + "" : "",
                    messageType: "FILE"
                }
                return fileMessage as T
            }
        }
        // unknown
        const obj = {
            text: "",
            messageType: "TEXT"
        }
        return { ...obj, ...msg } as T
    }

    downloadMedia(mediaId: string, transHandler?: MediaTransferHandler): Promise<void> {
        return new Promise(async (resove, reject) => {
            try {
                resove()
            } catch (error) {
                reject(error)
            }
        })
    }

    //频道
    createChannel(channelId: string): Channel {
        return new Channel(channelId, { context: this.context, request: this.test_request })
    }

    //语音
    createLocalInvitation(): LocalInvitation {
        return new LocalInvitation()
    }

    on(eventName: string, listener: Listener) {
        this.test_request?.on(eventName, listener)
    }
}
