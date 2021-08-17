import { EventEmitter } from "events"
export interface MessageType {}
export enum SoketKey {
    LOGIN = "LoginAck",
    LOGOUT = "LogoutAck",
    HEARTBEAT = "HeartbeatReq",
    QUERYPEERS_ONLINE_STATUS = "GetOnlineStatusAck",
    SEND_MESSAGE = "SendMessageAck",
    //状态
    SUBSCRIBE_ONLINE_STATUS = "SubscribeOnlineStatusAck",
    UNSUBSCRIBE_ONLINE_STATUS = "UnSubscribeOnlineStatusAck",
    GET_SUBSCRIBE_ONLINE_STATUS_UIDS = "GetSubscribeOnlineStatusUidsAck",
    //用户属性
    SET_USER_ATTRS = "SetUserAttrsAck",
    DELETE_USER_ATTRS = "DelUserAttrsAck",
    CLEAR_LOCAL_USER_ATTRS = "DelUserAllAttrsAck",
    GET_USER_ATTRIBUTES = "GetUserAttrsAck",
    // 频道属性
    SET_CHANNEL_ATTRS = "SetChannelAttrsAck",
    DELETE_CHANNEL_ATTRIBUTES = "DelChannelAttrsAck",
    CLEAR_CHANNEL_ATTRIBUTES = "DelChannelAllAttrsAck",
    GET_CHANNEL_ATTRIBUTES = "GetChannelAttrsAck",
    GET_CHANNEL_MEMBERS_COUNTS = "GetChannelMemberCountsAck",
    //频道方法
    GET_CHANNEL_MEMBERS = "GetChannelMembersAck",
    JOIN_CHANNEL = "JoinChannelAck",
    LEAVE_CHANNEL = "LeaveChannelAck",
    SEND_CHANNEL_MESSAGE = "SendChannelMessageAck"
}

enum notifyEventHashMap {
    LoginNotify = "PeersOnlineStatusChanged",
    KickNotify = "",
    onlineStatusChange = "ConnectionStateChanged",
    //以下通知暂时放在这里 ---- 应该分至channal
    SetChannelAttrsNotify = "AttributesUpdated",
    SetChannelAllAttrsNotify = "AttributesUpdated",
    DelChannelAttrsNotify = "AttributesUpdated",
    LeaveChannelNotify = "MemberLeft",
    JoinChannelNotify = "MemberJoined"
    // ="MemberCountUpdated"   ----------频道成员人数更新回调。返回最新频道成员人数
}

export interface PromiseValue {
    content: string
    resove: (value: any) => void
    reject: (error: Error) => void
    name: string
}

export interface SendOption {
    name: SoketKey
    message: MessageType
}

export default class Request extends EventEmitter {
    socket: null | WebSocket = null
    private baseURL: string = ""
    private protocols: string = ""
    private request_id: number = 0
    private status: number = 0
    private promisePools: Record<SoketKey, PromiseValue> | {} = {}
    constructor(baseURL: string, protocols: string) {
        super()
        this.baseURL = baseURL
        this.protocols = protocols
    }

    open(option: any) {
        this.socket = new WebSocket(this.baseURL, this.protocols)
        this.request_id = option.request_id
        const that = this
        return new Promise((resove, reject) => {
            function onopen(event: Event): void {
                resove(that.socket?.readyState)
            }

            function onclose(event: CloseEvent): void {
                console.log("close:", that.promisePools)
                Object.keys(that.promisePools).forEach(item => that.promisePools[item].reject("socket closed"))
                that.promisePools = {}
                that.emit(notifyEventHashMap.onlineStatusChange, { online: false })
            }

            function onmessage(event: MessageEvent): void {
                const data = JSON.parse(event.data)
                if (that.promisePools[data.uri]) {
                    if (data.error_code > 0) {
                        console.error(`error_code:${data.error_code} message:${data.error_message}`)
                        that.promisePools[data.uri].reject(data)
                    } else {
                        that.promisePools[data.uri].resove(data)
                    }
                    delete that.promisePools[data.uri]
                } else {
                    if (data.uri.includes("Notify")) {
                        if (data.uri === "JoinChannelNotify") {
                            console.log("JoinChannelNotify:", that)
                            that.emit("MemberJoined", "abc")
                        }
                        that.emit(notifyEventHashMap[data.uri], data)
                    }
                }
            }

            function onerror(event: any): void {
                console.log("error:", event)
                reject(event)
            }

            that.socket!.onopen = onopen
            that.socket!.onclose = onclose
            that.socket!.onmessage = onmessage
            that.socket!.onerror = onerror
        })
    }

    send(option: SendOption) {
        const { name, message } = option
        console.log("send:", name)
        return new Promise((resove, reject) => {
            if (this.socket?.readyState === 1) {
                this.promisePools[name] = {
                    content: message,
                    resove,
                    reject,
                    name
                }
                this.socket?.send(JSON.stringify(message))
            } else {
                reject("socket is closed!")
            }
        })
    }

    close() {
        //code?: number | undefined, reason?: string | undefined): void | undefined
        // this.socket?.close()
    }

    heartbeat() {
        setTimeout(() => {
            this.send({
                name: SoketKey.HEARTBEAT,
                message: {
                    uri: "HeartbeatReq",
                    request_id: this.request_id
                }
            })
        }, 360000)
    }
}
