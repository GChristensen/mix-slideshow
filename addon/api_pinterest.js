import {sleep} from "./utils.js";

export class PinterestAPI {
    PINTEREST_URL = "https://www.pinterest.com";

    #userName;

    constructor() {
        return this.authorize().then(() => this);
    }

    async authorize() {
        const json = await this.#fetchPinterestJSON("/resource/UserSettingsResource/get/");
        const userDetails = this.#handleResponse(json);
        if (userDetails)
            this.#userName = userDetails.username;
    }

    async checkAuthorization() {
        if (!this.isAuthorized) {
            await this.authorize();
            if (!this.isAuthorized) {
                cmdAPI.notifyError("The user is not logged in to Pinterest.")
                throw new Error("Pinterest is unauthorized");
            }
        }
        return this.isAuthorized;
    }

    get isAuthorized() {
        return !!this.#userName;
    }

    isPinterestURL(url) {
        return url.startsWith(this.PINTEREST_URL);
    }

    isPinURL(url) {
        return url.startsWith(`${this.PINTEREST_URL}/pin/`);
    }

    get userProfileURL() {
        if (this.#userName)
            return `${this.PINTEREST_URL}/${this.#userName}`;
    }

    getBoardURL(board) {
        return this.PINTEREST_URL + board.url;
    }

    async #fetchPinterestJSON(url, params, method) {
        url = `${this.PINTEREST_URL}${url}`;

        const init = {method: method || "get"};

        if (params) {
            params = new URLSearchParams(params).toString();

            if (init.method === "get")
                url = `${url}?${params}`;
            else
                init.body = params;
        }

        if (method === "post")
            init.headers = {
                "X-CSRFToken": await this.#getCSRFToken(url),
                "Content-Type": "application/x-www-form-urlencoded"
            };

        let json;
        try {
            const response = await fetch(url, init);

            if (response.redirected)
                this.PINTEREST_URL = new URL(response.url).origin;

            json = response.json();
        } catch (e) {
            console.error(e);
        }

        return json;
    }

    async #getCSRFToken(url) {
        const csrfTokenCookie = await browser.cookies.get({
            url: url,
            name: "csrftoken"
        });
        return csrfTokenCookie.value;
    }

    async #postPinterestJSON(url, params) {
        return this.#fetchPinterestJSON(url, params, "post")
    }

    #printError(error) {
        if (error) {
            const status = error.http_status;
            const message = error.message + " " + (error.message_detail || "");
            console.error(`Pinterest API error: HTTP status ${status}, (${message})`);
        }
        else
            console.error(`Pinterest API error: unknown`);
    }

    #handleResponse(json) {
        const success = json?.resource_response?.status === "success";

        if (success)
            return json.resource_response.data;
        else
            this.#printError(json?.resource_response?.error);
    }

    async #getBoardsPage(bookmark) {
        const pinterestOptions = {
            "options": {
                "username": this.#userName,
                "page_size": 100,
                "privacy_filter": "all",
                "field_set_key": "detailed",
                "group_by":"mix_public_private",
                "no_fetch_context_on_resource": false
            },
            "context": {}
        };

        if (bookmark)
            pinterestOptions.options.bookmarks = [bookmark];

        const params = {data: JSON.stringify(pinterestOptions)};
        const json = await this.#fetchPinterestJSON("/resource/BoardsResource/get/", params);

        if (json?.resource_response?.status === "success")
            return [json.resource_response.data, json.resource_response.bookmark];
        else {
            this.#printError(json?.resource_response?.error);
            return [null, null];
        }
    }

    async getBoards() {
        let boards = [], page, bookmark;

        do {
            [page, bookmark] = await this.#getBoardsPage(bookmark);
            if (page?.length)
                boards = [...boards, ...page];
        } while (bookmark);

        if (boards.length)
            return boards;
    }

    async createBoard(name) {
        const pinterestOptions = {
            "options": {
                "name": name,
                "description": "",
                "privacy": "public",
                "no_fetch_context_on_resource": false
            },
            "context": {}
        };

        const params = {
            source_url: `/${this.#userName}/`,
            data: JSON.stringify(pinterestOptions)
        };

        const json = await this.#postPinterestJSON("/resource/BoardResource/create/", params);
        await sleep(200);

        return this.#handleResponse(json);
    }

    async createPin(boardId, description, link, imageURL) {
        const pinterestOptions = {
            "options": {
                "board_id": boardId,
                "field_set_key": "create_success",
                "skip_pin_create_log": true,
                "description": description,
                "link": link,
                "title": "",
                "image_url": imageURL,
                "method": "scraped",
                "scrape_metric": {"source": "www_url_scrape"},
                "user_mention_tags": [],
                "no_fetch_context_on_resource": false
            },
            "context":{}
        };

        const params = {
            source_url: "/pin-builder/",
            data: JSON.stringify(pinterestOptions)
        };

        const json = await this.#postPinterestJSON("/resource/PinResource/create/", params);
        return !!this.#handleResponse(json);
    }

    async createRepin(boardId, description, link) {
        link = link.replace(/\/$/, "");
        const pinID = link.split("/").at(-1);

        const pinterestOptions = {
            "options": {
                "description": description,
                "pin_id": pinID,
                "title": "",
                "board_id": boardId,
                "no_fetch_context_on_resource": false
            }, "context": {}
        };

        const params = {
            source_url: `/pin/${pinID}/`,
            data: JSON.stringify(pinterestOptions)
        };

        const json = await this.#postPinterestJSON("/resource/RepinResource/create/", params);
        return !!this.#handleResponse(json);
    }
}
