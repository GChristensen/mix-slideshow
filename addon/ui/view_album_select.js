export class AlbumSelectView {
    onAlbumSelected;
    onSourceAuthorization;
    #containerId;

    constructor() {
        this.#containerId = "#albums";
        const container = $(this.#containerId);
        container.on("change", ".album-check", this.#onAlbumSelected.bind(this));
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

    renderAuthorizationLink(name, href) {
        const container = $(this.#containerId);
        const html = `<a id="source-authorization" href="${href}">Authorize in ${name}</a>`;

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