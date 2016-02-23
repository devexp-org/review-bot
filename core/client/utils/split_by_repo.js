/**
 * Splits pull requests by repo.
 *
 * @param {Array} list — pull requests from server
 *
 * @returns {Array}
 */
export default function (list) {
    var listByRepo = {};

    list.forEach((item) => {
        var fullName = item.repository.full_name;

        listByRepo[fullName] = listByRepo[fullName] || [];
        listByRepo[fullName].push(item);
    });

    return listByRepo;
}
