var MAIN_TITLE;

export default function (Component) {
    if (!MAIN_TITLE) {
        MAIN_TITLE = document.title;
    }

    var componentWillReceivePropsOld = Component.prototype.componentWillReceiveProps,
        componentDidMountOld = Component.prototype.componentDidMount;

    Component.prototype.setPageTitle = function (nextProps) {
        if (Component.getPageTitle) {
            document.title = MAIN_TITLE + ' — ' + Component.getPageTitle(nextProps);
        }
    };

    Component.prototype.componentDidMount = function () {
        this.setPageTitle();

        if (componentDidMountOld) {
            componentDidMountOld.call(Component);
        }
    };

    Component.prototype.componentWillReceiveProps = function (nextProps) {
        this.setPageTitle(nextProps);

        if (componentWillReceivePropsOld) {
            componentWillReceivePropsOld.call(Component, nextProps);
        }
    };

    return Component;
}
