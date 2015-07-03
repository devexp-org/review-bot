import MAP from 'app/config/status_to_color';

export default function statusToColor(status) {
    return MAP[status] || 'default';
}
