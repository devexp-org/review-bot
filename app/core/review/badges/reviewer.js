export default function reviewerBadgeCreator() {
    return function reviewerBadge(reviewer) {
        return {
            subject: reviewer.login,
            status: reviewer.aproved ? 'ok' : '...',
            color: reviewer.aproved ? 'green' : 'yellow'
        };
    };
}
