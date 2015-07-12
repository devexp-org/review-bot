import MAP from 'app/config/client/status_to_color';

export default function statusToColor(status) {
    return MAP[status] || 'default';
}
