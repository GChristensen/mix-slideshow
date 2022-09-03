import {ControllerBase} from "./controller_base.js";
import {AlbumSelectView} from "./view_album_select.js";
import {showNotification} from "../../utils.js";
import {settings} from "../../settings.js";

export class AlbumSelectController extends ControllerBase {
    #albumSelectView = new AlbumSelectView();
    #sourceId;
    #model;

    constructor() {
        super();

        this.#albumSelectView.onPresetChanged = this.#onPresetChanged.bind(this);
        this.#albumSelectView.onPresetSave = this.#onPresetSave.bind(this);
        this.#albumSelectView.onPresetDelete = this.#onPresetDelete.bind(this);
        this.#albumSelectView.onSourceChanged = this.#onSourceChanged.bind(this);
        this.#albumSelectView.onAlbumSelected = this.#onAlbumSelected.bind(this);
        this.#albumSelectView.onSourceAuthorization = this.#onSourceAuthorization.bind(this);
        this.listPresets();
        this.listAlbums();
    }

    async listPresets() {
        let presets = settings.presets() || [];

        this.#albumSelectView.renderPresets(presets);
    }

    async listAlbums() {
        const sourceId = this.#albumSelectView.getSelectedSource();

        this.#albumSelectView.displayLoading();

        if (this.#sourceId !== sourceId) {
            this.#sourceId = sourceId

            try {
                this.#model = await this.createModel(this.#sourceId);
            } catch (e) {
                showNotification("Error accessing resource.");
                throw e;
            }
        }

        if (this.#model.isAuthorized) {
            let sourceAlbums;

            try {
                sourceAlbums = await this.#model.getAlbums() || [];
            } catch (e) {
                showNotification("Error obtaining album list.");
                throw e;
            }

            const selectedAlbums = await this.getSelectedAlbums(sourceId);

            this.#albumSelectView.renderAlbums(sourceAlbums, selectedAlbums);
        }
        else
            this.#albumSelectView.renderAuthorizationLink(this.#model.authorizationText, "#");
    }

    async #onPresetChanged(presetName) {
        await settings.load();

        const presets = settings.presets();
        const selectedPreset = presets.find(p => p.name === presetName);

        for (const item of selectedPreset.selection)
            await settings.set(item.source, item.albums);

        const selectedSource = this._getSelectedAlbumsId(this.#albumSelectView.getSelectedSource());
        const albumsToSelect = selectedPreset.selection.find(s => s.source === selectedSource).albums;

        this.#albumSelectView.selectAlbums(albumsToSelect);
    }

    async #onPresetSave(presetName) {
        await settings.load();

        const allSettings = Object.entries(await browser.storage.local.get() || {});
        const seletedAlbums = allSettings.filter(s => s[0].startsWith(this.SELECTED_ALBUMS_PREFIX));

        const preset = {
            name: presetName,
            selection: [...seletedAlbums.map(a => ({source: a[0], albums: a[1]}))]
        }

        let presets = settings.presets() || [];
        const existing = presets.find(p => p.name.toLocaleLowerCase() === presetName.toLocaleLowerCase());

        if (existing)
            presets.splice(presets.indexOf(existing), 1);

        presets = [...presets, preset];
        await settings.presets(presets);

        this.#albumSelectView.renderPresets(presets, presetName);
    }

    async #onPresetDelete(presetName) {
        await settings.load();

        let presets = settings.presets() || [];
        const existing = presets.find(p => p.name.toLocaleLowerCase() === presetName.toLocaleLowerCase());

        if (existing)
            presets.splice(presets.indexOf(existing), 1);

        await settings.presets(presets);

        this.#albumSelectView.renderPresets(presets);
    }

    async #onSourceChanged() {
        return this.listAlbums();
    }

    async #onAlbumSelected(selectedAlbums) {
        return this.setSelectedAlbums(this.#sourceId, selectedAlbums);
    }

    async #onSourceAuthorization() {
        await this.#model.authorize();
        return this.listAlbums();
    }
}