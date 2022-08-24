import {PinterestModel} from "./model_pinterest.js";
import {settings} from "../settings.js";

export class ControllerBase {
    PINTEREST_BOARDS = "pinterest-boards";

    _sources;

    constructor() {
        this._sources = [this.PINTEREST_BOARDS];
    }

    async createModel(sourceId) {
        switch (sourceId) {
            case this.PINTEREST_BOARDS:
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