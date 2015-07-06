function statusToColor(status) {
    switch (status) {
        case 'inprogress':
            return 'yellow';
        case 'complete':
            return 'green';
        default:
            return 'lightgrey';
    }
}

export default function reviewStatusBadgeCreator() {
    return function reviewStatusBadge(review) {
        return {
            subject: 'review',
            status: review.status,
            color: statusToColor(review.status)
        };
    };
}
