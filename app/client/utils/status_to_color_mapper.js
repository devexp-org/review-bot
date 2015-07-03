// TODO: Client side modules config loader
const MAP = {
    'open': 'success',
    'closed': 'danger',
    'notstarted': 'default',
    'inprogress': 'warning',
    'complete': 'success'
};

export default function statusToColor(status) {
    return MAP[status] || 'default';
}
