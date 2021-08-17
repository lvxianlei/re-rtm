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
