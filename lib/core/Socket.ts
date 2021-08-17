// 由于class形式 会出现收到通知触发emit时，事件分配不到具体的事件。现尝试改造
import { EventEmitter, Listener } from "events"
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

export interface SocketProps {
    open: (option: any) => Promise<any>
    send: (option: any) => Promise<any>
    close: () => Promise<any>
    heartbeat: () => void
    emit: (type: string | number, ...args: any[]) => boolean
    on: (type: string | number, listener: Listener) => EventEmitter
}

export interface SocketContext {
    socket: null | WebSocket
    baseURL: string
    protocols: string
    request_id: number
    status: number
    promisePools: Record<SoketKey, PromiseValue> | {}
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

export default function Socket(baseURL: string, protocols: string): SocketProps {
    const socketContext: SocketContext = {
        socket: null,
        baseURL: baseURL || "",
        protocols: protocols || "",
        request_id: 0,
        status: 0,
        promisePools: {}
    }

    return {
        emit: EventEmitter.prototype.emit,
        on: EventEmitter.prototype.on,
        open(option: any): Promise<any> {
            socketContext.socket = new WebSocket(socketContext.baseURL, socketContext.protocols)
            socketContext.request_id = option.request_id
            const that = this
            return new Promise((resove, reject) => {
                function onopen(event: Event): void {
                    resove(socketContext.socket?.readyState)
                }

                function onclose(event: CloseEvent): void {
                    console.log("close:", socketContext.promisePools)
                    Object.keys(socketContext.promisePools).forEach(item =>
                        socketContext.promisePools[item].reject("socket closed")
                    )
                    socketContext.promisePools = {}
                    that.emit(notifyEventHashMap.onlineStatusChange, { online: false })
                }

                function onmessage(event: MessageEvent): void {
                    console.log("onmessage:", that)
                    const data = JSON.parse(event.data)
                    if (socketContext.promisePools[data.uri]) {
                        if (data.error_code > 0) {
                            console.error(`error_code:${data.error_code} message:${data.error_message}`)
                            socketContext.promisePools[data.uri].reject(data)
                        } else {
                            socketContext.promisePools[data.uri].resove(data)
                        }
                        delete socketContext.promisePools[data.uri]
                    } else {
                        if (data.uri.includes("Notify")) {
                            if (data.uri === "JoinChannelNotify") {
                                console.log("JoinChannelNotify:", that)
                                // that.emit("MemberJoined", "abc")
                            }
                            that.emit(notifyEventHashMap[data.uri], data)
                        }
                    }
                }

                function onerror(event: any): void {
                    console.log("error:", event)
                    reject(event)
                }

                socketContext.socket!.onopen = onopen
                socketContext.socket!.onclose = onclose
                socketContext.socket!.onmessage = onmessage
                socketContext.socket!.onerror = onerror
            })
        },
        send(option: SendOption): Promise<any> {
            const { name, message } = option
            console.log("send:", name)
            return new Promise((resove, reject) => {
                if (socketContext.socket?.readyState === 1) {
                    socketContext.promisePools[name] = {
                        content: message,
                        resove,
                        reject,
                        name
                    }
                    socketContext.socket?.send(JSON.stringify(message))
                } else {
                    reject("socket is closed!")
                }
            })
        },

        close(): Promise<any> {
            //code?: number | undefined, reason?: string | undefined): void | undefined
            // this.socket?.close()
            return new Promise((resove, reject) => {})
        },
        heartbeat() {
            setTimeout(() => {
                this.send({
                    name: SoketKey.HEARTBEAT,
                    message: {
                        uri: "HeartbeatReq",
                        request_id: socketContext.request_id
                    }
                })
            }, 360000)
        }
    }
}
