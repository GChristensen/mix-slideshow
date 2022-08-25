import {PinterestModel} from "./model_pinterest.js";
import {settings} from "../settings.js";

export class ControllerBase {
    _sources;

    constructor() {
        this._sources = [PinterestModel.ID];
    }

    async createModel(sourceId) {
        switch (sourceId) {
            case PinterestModel.ID:
                return new PinterestModel();
        }
    }

    async getSelectedAlbums(sourceId) {
        return await settings.get(`${sourceId}-selected-albums`) || [];
    }

    async setSelectedAlbums(sourceId, albums) {
        return settings.set(`${sourceId}-selected-albums`, albums);
    }
}