import {settings} from "../../settings.js";
import {PinterestModel} from "./model_pinterest.js";
import {LocalFoldersModel} from "./model_local_folders.js";

export class ControllerBase {
    _sources;

    constructor() {
        this._sources = [PinterestModel.ID, LocalFoldersModel.ID];
    }

    async createModel(sourceId) {
        switch (sourceId) {
            case PinterestModel.ID:
                return new PinterestModel();
            case LocalFoldersModel.ID:
                return new LocalFoldersModel();
        }
    }

    #getSelectedAlbumsId(sourceId) {
        return `selected-albums-${sourceId}`;
    }

    async getSelectedAlbums(sourceId) {
        const selectedAlbumsId = this.#getSelectedAlbumsId(sourceId);
        return await settings.get(selectedAlbumsId) || [];
    }

    async setSelectedAlbums(sourceId, albums) {
        const selectedAlbumsId = this.#getSelectedAlbumsId(sourceId);
        return settings.set(selectedAlbumsId, albums);
    }
}