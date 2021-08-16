let msg_id: number = 0
export function get_msg_id() {
    const date_new = Date.now ? Date.now() : +new Date()
    return (date_new << 22) | (++msg_id & 0x3fffff)
}
