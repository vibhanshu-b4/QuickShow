export const dateFormat = (date) => {
    return new Date(date).toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata',
        weekday: 'short',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
    })
}