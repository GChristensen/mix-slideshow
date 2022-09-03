import {settings} from "../../settings.js";
import {sortByName} from "../../utils.js";

export class AlbumSelectView {
    onPresetChanged;
    onPresetSave;
    onPresetDelete;
    onSourceChanged;
    onAlbumSelected;
    onSourceAuthorization;
    #containerId;

    constructor() {
        this.#containerId = "#albums";
        const container = $(this.#containerId);
        container.on("change", ".album-check", this.#onAlbumSelected.bind(this));

        const selectedSourceId = settings.selected_source();
        if (selectedSourceId)
            $(`#source-selector option[value='${selectedSourceId}']`).prop("selected", true);

        const sourceSelect = $("#source");
        sourceSelect.on("change", this.#onSourceChanged.bind(this));

        const presetSelect = $("#preset");
        presetSelect.css("min-width", sourceSelect.outerWidth() + "px");
        presetSelect.on("change", this.#onPresetChanged.bind(this));

        $("#save-preset-link").on("click", this.#onPresetSave.bind(this));
        $("#delete-preset-link").on("click", this.#onPresetDelete.bind(this));
    }

    renderPresets(presets, selectedPreset) {
        presets = [...presets];
        sortByName(presets);

        const presetSelect = $("#preset");

        presetSelect.empty();

        for (const preset of presets) {
            const presetOption = `<option value="${preset.name}">${preset.name}</option>`;

            $(presetOption).appendTo(presetSelect);
        }

        if (selectedPreset)
            $(`#preset option[value='${selectedPreset}']`).prop("selected", true);
        else
            presetSelect.prop("selectedIndex", -1);
    }

    selectAlbums(selectedAlbums) {
        $("#albums input[type='checkbox']").prop("checked", false);

        for (const albumId of selectedAlbums)
            $(`#albums input[value='${albumId}']`).prop("checked", true);
    }

    getSelectedSource() {
        const sourceSelect = $("#source");
        return sourceSelect.val();
    }

    displayLoading() {
        const container = $(this.#containerId);

        container.empty();

        container.append(`
            <div class="loading-albums-container">
                <img src="icons/loading-albums.gif"/>
            </div>
        `);
    }

    renderAuthorizationLink(linkText, href) {
        const container = $(this.#containerId);
        const html = `<a id="source-authorization" href="${href}">${linkText}</a>`;

        container.empty();
        const link = $(html).appendTo(container);
        link.on("click", e => {
            e.preventDefault();
            if (this.onSourceAuthorization)
                this.onSourceAuthorization();
        })
    }

    renderAlbums(albums, selectedAlbums) {
        const container = $(this.#containerId);

        container.empty();

        this.#renderSelectAll(container, albums.length === selectedAlbums.length);

        this.#renderAlbums(container, albums, selectedAlbums);
    }

    #renderSelectAll(container, checked) {
        const selectAllChecked = checked? "checked": "";

        const selectAllCheck = `
                <div class="album-check-container">
                    <input type="checkbox" id="select-all-albums" class="album-check" ${selectAllChecked}/>
                    <label for="select-all-albums"><b>Select all</b></label> 
                </div>`;

        $(selectAllCheck).appendTo(container);
    }

    #renderAlbums(container, albums, selectedAlbums) {
        for (const album of albums) {
            const checked = selectedAlbums.some(id => id === album.id)
                ? "checked"
                : "";

            const albumCheck = `
                <div class="album-check-container">
                    <input type="checkbox" id="album-${album.id}" class="album-check" value="${album.id}" ${checked}/>
                    <label for="album-${album.id}" class="album-check-label">${album.name}</label> 
                </div>`;

            $(albumCheck).appendTo(container);
        }
    }

    async #onPresetChanged(e) {
        const sourceId = e.target.value;

        if (this.onPresetChanged)
            this.onPresetChanged(sourceId);
    }

    async #onPresetSave(e) {
        e.preventDefault();

        const presetName = prompt("Name: ");

        if (presetName && this.onPresetSave) {
            this.onPresetSave(presetName);
        }
    }

    async #onPresetDelete(e) {
        e.preventDefault();

        const presetName = $("#preset").val();
        const confirmed = confirm("Do you really want to delete the selected preset?");

        if (presetName && confirmed && this.onPresetDelete) {
            $(`#preset option[value='${presetName}']`).remove();
            this.onPresetDelete(presetName);
        }
    }

    async #onSourceChanged(e) {
        const sourceId = e.target.value;

        settings.selected_source(sourceId);

        if (this.onSourceChanged)
            this.onSourceChanged(sourceId);
    }

    #onAlbumSelected(e) {
        if (e.target.id === "select-all-albums")
            $(".album-check").prop("checked", e.target.checked);

        if (this.onAlbumSelected) {
            const checkedAlbums = $(".album-check:checked");
            const checkedAlbumIDs = checkedAlbums.map(function() {
                if (this.id !== "select-all-albums")
                    return this.value;
            });

            this.onAlbumSelected(checkedAlbumIDs.toArray().filter(id => !!id));
        }
    }
}