import Plugin from 'src/plugin-system/plugin.class';

export default class HMnetFormPlugin extends Plugin {

    static options = {
        successDuration: 5000,
    };

    init() {
        this._registerEvents();
    }

    _registerEvents() {
        this.el.addEventListener('submit', this._onSubmit.bind(this));
    }

    _onSubmit(event) {
        event.preventDefault();

        if (!this.el.checkValidity()) {
            this.el.reportValidity();
            return;
        }

        this._setLoading(true);
        this._clearMessages();

        const formData = new FormData(this.el);

        fetch(this.el.action, {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
            },
        })
            .then(response => response.json())
            .then(data => this._handleResponse(data))
            .catch(() => {
                this._showMessage('danger', 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
            })
            .finally(() => {
                this._setLoading(false);
            });
    }

    _handleResponse(response) {
        if (!Array.isArray(response) || response.length === 0) {
            return;
        }

        let isSuccess = true;

        response.forEach(item => {
            if (item.type === 'danger' || item.type === 'warning') {
                isSuccess = false;
            }
            this._showMessage(item.type || 'info', item.alert);
        });

        if (isSuccess) {
            this.el.reset();
            this._autoDismissMessages();
        }
    }

    _setLoading(loading) {
        const btn = this.el.querySelector('[type="submit"]');
        if (!btn) return;

        if (loading) {
            btn.disabled = true;
            btn.dataset.originalText = btn.innerHTML;
            btn.innerHTML = `
                <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Wird gesendet...
            `;
        } else {
            btn.disabled = false;
            if (btn.dataset.originalText) {
                btn.innerHTML = btn.dataset.originalText;
            }
        }
    }

    _showMessage(type, text) {
        const container = this._getMessageContainer();
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} hmnet-form-alert`;
        alert.setAttribute('role', 'alert');
        alert.innerHTML = text;
        container.appendChild(alert);
    }

    _clearMessages() {
        const container = this._getMessageContainer();
        container.innerHTML = '';
    }

    _getMessageContainer() {
        let container = this.el.querySelector('.hmnet-form-messages');
        if (!container) {
            container = document.createElement('div');
            container.className = 'hmnet-form-messages';
            // Insert before the submit button area
            const submitArea = this.el.querySelector('.d-grid, .d-md-flex');
            if (submitArea) {
                submitArea.parentNode.insertBefore(container, submitArea);
            } else {
                this.el.appendChild(container);
            }
        }
        return container;
    }

    _autoDismissMessages() {
        setTimeout(() => {
            const container = this._getMessageContainer();
            const alerts = container.querySelectorAll('.hmnet-form-alert');
            alerts.forEach(alert => {
                alert.style.transition = 'opacity 0.4s ease';
                alert.style.opacity = '0';
                setTimeout(() => alert.remove(), 400);
            });
        }, this.options.successDuration);
    }
}
