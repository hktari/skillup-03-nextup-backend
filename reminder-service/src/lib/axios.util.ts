

export function transformParseDateFields (data: any) {
    const dateKeyRx = /date/i;
    return JSON.parse(data, (key, value) => {
        return dateKeyRx.test(key) ? new Date(value) : value;
    });
}