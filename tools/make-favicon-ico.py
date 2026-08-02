#!/usr/bin/env python3
"""Empacota PNGs quadrados num favicon.ico multirresolução.

O .ico é só um contêiner: desde o Vista ele aceita PNG embutido, então não há
recodificação de imagem — os PNGs entram byte a byte. Sem dependências.

Os PNGs vêm de assets/img/_favicon-template.html, renderizado pelo Chrome
headless (instruções no topo daquele arquivo).

Uso:
    python tools/make-favicon-ico.py fav-16.png fav-32.png fav-48.png fav-96.png

Escreve favicon.ico na raiz do repositório.
"""
import struct
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def png_size(blob: bytes) -> tuple[int, int]:
    if blob[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError("não é um PNG")
    # IHDR é sempre o primeiro chunk: 8 bytes de assinatura + 8 de cabeçalho
    # do chunk, e então largura e altura em big-endian.
    width, height = struct.unpack(">II", blob[16:24])
    if width != height:
        raise ValueError(f"ícone não é quadrado: {width}x{height}")
    return width, height


def make_ico(paths: list[Path], out: Path) -> None:
    images = []
    for path in paths:
        blob = path.read_bytes()
        width, _ = png_size(blob)
        images.append((width, blob))
    images.sort(key=lambda item: item[0])

    # ICONDIR: reservado, tipo 1 (ícone), quantidade.
    header = struct.pack("<HHH", 0, 1, len(images))
    offset = len(header) + 16 * len(images)

    entries, payload = b"", b""
    for width, blob in images:
        # Largura/altura ocupam 1 byte cada; 0 significa 256.
        dim = 0 if width >= 256 else width
        entries += struct.pack(
            "<BBBBHHII", dim, dim, 0, 0, 1, 32, len(blob), offset
        )
        offset += len(blob)
        payload += blob

    out.write_bytes(header + entries + payload)


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 1
    paths = [Path(arg) for arg in sys.argv[1:]]
    missing = [p for p in paths if not p.is_file()]
    if missing:
        print("não encontrado: " + ", ".join(str(p) for p in missing))
        return 1

    out = ROOT / "favicon.ico"
    make_ico(paths, out)
    sizes = ", ".join(str(png_size(p.read_bytes())[0]) for p in paths)
    print(f"{out} escrito — {out.stat().st_size} bytes, tamanhos: {sizes}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
