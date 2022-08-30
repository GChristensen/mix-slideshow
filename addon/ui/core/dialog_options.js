import {settings} from "../../settings.js";

export class OptionsDialog {
    #dialog;

    constructor() {
        const dialog = $("#options-dialog");
        this.#dialog = dialog[0];
        dialog.on("click", this.#onClick.bind(this));
        $("#option-button-ok").on("click", this.#onOK.bind(this));
        $("#option-button-cancel").on("click", this.#onCancel.bind(this));
    }

    show() {
        $("#option-delay").val(settings.delay());
        $("#option-shuffle").prop("checked", settings.shuffle());
        $("#option-repeat").prop("checked", settings.repeat());
        $("#option-stretch").prop("checked", settings.stretch());
        $("#option-crossfade").prop("checked", settings.crossfade());

        this.#dialog.showModal();
    }

    #onClick(e) {
        e.stopPropagation();
    }

    async #onOK() {
        settings.delay(parseInt($("#option-delay").val()), false);
        settings.shuffle($("#option-shuffle").is(":checked"), false);
        settings.repeat($("#option-repeat").is(":checked"), false);
        settings.stretch($("#option-stretch").is(":checked"), false);
        await settings.crossfade($("#option-crossfade").is(":checked"));

        this.#dialog.close();
    }

    #onCancel() {
        this.#dialog.close();
    }
}