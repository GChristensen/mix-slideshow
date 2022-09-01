import os
import json
import logging
import platform
import threading
import subprocess

from flask import request, Response, abort, send_file

from . import browser
from .server import app, host, get_server_port, requires_auth, message_mutex

album_mutex = threading.Lock()
albums = dict()

IMAGE_EXTENSIONS = [
    ".jpg",
    ".jpeg",
    ".jfif",
    ".tiff",
    ".webp",
    ".png",
    ".gif",
    ".bmp",
    ".svg"
]

@app.route("/list/images", methods=['POST'])
@requires_auth
def list_images():
    album_id = request.form["id"]
    album = request.form.to_dict()

    album_mutex.acquire()
    albums[album_id] = album
    album_mutex.release()

    album["images"] = collect_images(album["path"], album["recursive"] == "true")
    image_links = generate_image_links(album)

    return json.dumps(image_links)


def collect_images(path, recursive):
    images = []

    for root, dirs, files in os.walk(path):
        for file in files:
            parts = os.path.splitext(file)
            ext = parts[1].lower()
            if ext in IMAGE_EXTENSIONS:
                images.append(os.path.join(root, file))

        if not recursive:
            break

    return images


def generate_image_links(album):
    http_port = get_server_port()
    image_links = []
    ctr = 0

    for image in album["images"]:
        image_links.append(dict(
            id=str(ctr),
            url=f"http://{host}:{str(http_port)}/images/{album['id']}/{str(ctr)}",
            sourceURL=f"http://{host}:{str(http_port)}/open/{album['id']}/{str(ctr)}",
            localPath=image
        ))
        ctr += 1

    return image_links


@app.route("/images/<album_id>/<image_index>", methods=['GET'])
def send_image(album_id, image_index):
    album = albums[album_id]
    image_path = album["images"][int(image_index)]

    return send_file(image_path)


@app.route("/open/<album_id>/<image_index>", methods=['GET'])
def open_image(album_id, image_index):
    album = albums[album_id]
    image_path = album["images"][int(image_index)]

    if platform.system() == 'Darwin':
        subprocess.call(('open', image_path))
    elif platform.system() == 'Windows':
        os.startfile(image_path)
    else:
        subprocess.call(('xdg-open', image_path))

    return "", 204