import {$, append, apply, closest, css, pointerEnter, pointerLeave, remove, startsWith, toFloat, Transition, trigger} from 'uikit-util';

export default {

    functional: true,

    args: ['message', 'status'],

    data: {
        message: '',
        status: '',
        timeout: 5000,
        group: null,
        pos: 'top-center',
        clsContainer: 'uk-notification',
        clsClose: 'uk-notification-close',
        clsMsg: 'uk-notification-message'
    },

    install,

    computed: {

        marginProp({pos}) {
            return `margin${startsWith(pos, 'top') ? 'Top' : 'Bottom'}`;
        },

        startProps() {
            return {opacity: 0, [this.marginProp]: -this.$el.offsetHeight};
        }

    },

    created() {

        const container = $(`.${this.clsContainer}-${this.pos}`, this.$container)
            || append(this.$container, `<div class="${this.clsContainer} ${this.clsContainer}-${this.pos}" style="display: block"></div>`);

        this.$mount(append(container,
            `<div class="${this.clsMsg}${this.status ? ` ${this.clsMsg}-${this.status}` : ''}">
                <a href class="${this.clsClose}" data-uk-close></a>
                <div>${this.message}</div>
            </div>`
        ));

    },

    connected() {

        const margin = toFloat(css(this.$el, this.marginProp));
        Transition.start(
            css(this.$el, this.startProps),
            {opacity: 1, [this.marginProp]: margin}
        ).then(() => {
            if (this.timeout) {
                this.timer = setTimeout(this.close, this.timeout);
            }
        });

    },

    events: {

        click(e) {
            if (closest(e.target, 'a[href="#"],a[href=""]')) {
                e.preventDefault();
            }
            this.close();
        },

        [pointerEnter]() {
            if (this.timer) {
                clearTimeout(this.timer);
            }
        },

        [pointerLeave]() {
            if (this.timeout) {
                this.timer = setTimeout(this.close, this.timeout);
            }
        }

    },

    methods: {

        close(immediate) {

            const removeFn = () => {

                const container = this.$el.parentNode;

                trigger(this.$el, 'close', [this]);
                remove(this.$el);

                if (container && !container.hasChildNodes()) {
                    remove(container);
                }

            };

            if (this.timer) {
                clearTimeout(this.timer);
            }

            if (immediate) {
                removeFn();
            } else {
                Transition.start(this.$el, this.startProps).then(removeFn);
            }
        }

    }

};

function install(UIkit) {
    UIkit.notification.closeAll = function (group, immediate) {
        apply(document.body, el => {
            const notification = UIkit.getComponent(el, 'notification');
            if (notification && (!group || group === notification.group)) {
                notification.close(immediate);
            }
        });
    };
}
