# Landing page — Dra. Lorena Fecury (Pneumologista)

Página única em HTML, CSS e JS puros. Sem framework, sem build, sem backend,
sem nenhuma requisição a terceiros. Basta subir os arquivos em qualquer
hospedagem estática.

## Rodar localmente

```bash
python -m http.server 8080
```

Depois abra <http://localhost:8080>.

## Estrutura

```
index.html                       página completa, semântica, com JSON-LD
assets/css/style.css             tokens, layout e animações
assets/js/main.js                header, menu mobile, reveal on scroll, scroll spy
assets/fonts/lora-latin-var.woff2  Lora variável (400–600), subset latin
assets/img/logo-pulmao*.svg      marca (navy e branca), gerada do Figma
assets/img/favicon.svg           favicon vetorial (ícone da aba)
favicon.ico                      raster 16/32/48/96 — o que o Google usa na busca
tools/make-favicon-ico.py        empacota os PNGs no .ico (stdlib, sem deps)
robots.txt · sitemap.xml · site.webmanifest
CNAME                            domínio custom (GitHub Pages)
.nojekyll                        no-op no deploy atual: o workflow publica via
                                 Actions, que não roda Jekyll. Fica só como
                                 rede de segurança se um dia voltar a publicar
                                 direto de um branch.
```

### Imagens

A página exibe **uma única foto**, na seção "Sobre". O hero não tem retrato: é
tipográfico, com o nome ocupando toda a largura.

| Arquivo | O que é |
| --- | --- |
| `dra-lorena.jpg` | a foto servida na página — recorte central 4:5 (854×1068), q75 |
| `dra-lorena-original.jpeg` | o original enviado, 854×1280. Não é usado na página; fica como fonte para recortar de novo. Pode ficar fora do deploy. |
| `og-image.jpg` | prévia em redes sociais, 1200×630 |
| `apple-touch-icon.png` | ícone de tela inicial do iOS, 180×180 |
| `favicon.svg` | ícone da aba nos navegadores modernos — marca navy sobre transparente |
| `favicon.ico` (na raiz) | raster 16/32/48/96, marca branca sobre navy |

### Os dois favicons

O `favicon.svg` continua sendo o ícone da aba. O `favicon.ico` existe porque a
linha fina da marca antialiasa para um borrão cinza a 16px — tamanho em que o
Google exibe o favicon nos resultados de busca. A arte do `.ico` é a mesma do
`apple-touch-icon`: marca branca sobre navy, que a esse tamanho ainda lê como um
bloco sólido da cor da marca.

O `sizes="32x32"` no `<link>` do `.ico` é o que faz os navegadores modernos
preferirem o SVG. Sem ele, alguns escolheriam o raster.

Para regerar: renderize `assets/img/_favicon-template.html` no Chrome headless
nos quatro tamanhos (instruções no topo do arquivo) e rode

```bash
python tools/make-favicon-ico.py fav-16.png fav-32.png fav-48.png fav-96.png
```

O 96px precisa de `--force-device-scale-factor=2` com `--window-size=48,48`: em
janela de 96px o Chrome headless às vezes captura antes do SVG carregar.

O recorte 4:5 é exatamente o que o `object-fit: cover` já exibia — cortar na
origem só evita baixar pixels que seriam descartados.

`_og-template.html` e `_touch-template.html` são os *templates* que geram a
`og-image.jpg` e o `apple-touch-icon.png` com a fonte e o logo reais da marca.
Não fazem parte da página; as instruções para regerá-los estão em comentário no
topo de cada um. Se preferir, pode excluí-los do que vai para produção.

Para trocar a foto: substitua `dra-lorena-original.jpeg`, recorte em 4:5 e salve
como `dra-lorena.jpg` (qualquer editor serve). Depois regere a `og-image.jpg`
pelo template, que usa a mesma foto.

## Identidade visual

Extraída do Figma (arquivo `reATPB1giejZLxosVtH39c`, `Section 2` / node `38:13`).

| Token | Hex | Uso |
| --- | --- | --- |
| `--navy` | `#163B5C` | títulos, logo, rodapé, blocos sólidos |
| `--blue` | `#5D84A3` | **só grafismo**: ícones, filetes, pontos |
| `--blue-text` | `#46708F` | texto em azul — `--blue` não atinge 4,5:1 em corpo pequeno |
| `--sky` | `#DDEAF4` | grafismo do hero, texto de apoio sobre navy |
| `--pattern` | `#F0F5FA` | fundo de seções alternadas |

Tipografia: **Lora** (única fonte da marca) nos títulos, logo e destaques;
corpo de texto em stack de sistema, para leitura melhor em parágrafos longos e
zero byte de download. A assinatura tipográfica é o *kicker* com
`letter-spacing: 0.4em`, medido do descritor "Pneumologista" do logo original.

A marca é renderizada como **texto HTML real + SVG inline** (nunca imagem do
lockup), então o nome é selecionável, indexável e nítido em qualquer DPI.

### A marca (atualizada do Figma)

O desenho vem do lockup horizontal `113:1666`, que substituiu as versões
antigas. Os SVGs em `assets/img/` foram extraídos dele — os paths da árvore
brônquica separados dos contornos das letras — e o wordmark segue como texto
Lora de verdade.

Dois problemas do desenho anterior que o novo corrige: a traqueia tinha uma
**costura vertical** no meio (a marca antiga era feita de duas metades
espelhadas) e havia **alvéolos soltos**, sem ramo ligando até eles. O traço novo
também é mais fino, por isso a marca ganhou um pouco mais de corpo no header.

O Figma traz duas composições: vertical (marca sobre o nome) e horizontal
(marca à esquerda, nome à direita). O header e o rodapé usam a horizontal.

### O nome no hero

`.hero__title` está calibrado para ocupar toda a largura útil **em uma linha**,
em qualquer viewport. A caixa de texto de "Dra. Lorena Fecury" em Lora mede
≈8,75× o corpo da fonte; o caso mais apertado é 320px de viewport (280px úteis),
que fixa o coeficiente em `9,6vw`. De 1180px para cima a área útil é constante
em 1100px, então o teto de `7,6rem` trabalha com ~3% de folga.

Medido em 15 larguras entre 320px e 2560px: sempre uma linha, sem overflow
horizontal, com 90–97% de aproveitamento da largura. Se mudar o texto do `h1` ou
a fonte, **remeça** — a calibração é específica desta string.

## Animações

Só `transform` e `opacity`, para tudo rodar na GPU (TBT medido: 0 ms).

- **Assinatura**: no hero, a árvore brônquica se desenha — o path das
  ramificações é revelado de cima para baixo (traqueia → brônquios) e os
  alvéolos florescem em três bandas escalonadas.
- Entrada em cascata do conteúdo do hero (CSS puro, não depende do JS).
- Reveal on scroll com um único `IntersectionObserver`, escalonado via `--i`.
- Header com fundo/blur ao rolar; FAQ com expansão suave; cards com elevação e
  ícone que se redesenha no hover.
- `prefers-reduced-motion: reduce` desliga tudo e revela o conteúdo de imediato.

Não há **nenhum listener de scroll**. O header e o botão flutuante reagem por
sentinelas de `IntersectionObserver`: ler `window.scrollY` forçava um layout
sincrono de ~30 ms nesta página (o SVG da marca é grande), e o observer entrega
a mesma informação dentro do ciclo normal de renderização, de graça.

O comprimento do traço de cada ícone (`--len`) está **fixado no HTML**. Medir em
runtime com `getTotalLength()` custava ~50 ms de layout sincrono. Ao alterar o
`d` de um ícone, remeça no console:

```js
[...document.querySelectorAll('.card__icon .draw')].map(e => Math.ceil(e.getTotalLength()))
```

## Lighthouse (medido)

Medido com a foto e a marca definitivas no lugar.

| | Performance | Acessibilidade | Boas práticas | SEO |
| --- | --- | --- | --- | --- |
| Desktop | **100** | **100** | **100** | **100** |
| Mobile | **99** | **100** | **100** | **100** |

Desktop: FCP 0,3 s · LCP 0,5 s · TBT 0 ms · CLS 0.
Mobile (throttling 4G do Lighthouse): FCP 1,1 s · LCP 2,0 s · TBT 0 ms · CLS 0.

O ponto que falta no mobile é o LCP. Três alavancas, em ordem de retorno:

- **Servir a foto em AVIF/WebP** com `<picture>`. Os ~70 KB do JPEG viram
  ~30 KB. Não foi feito aqui porque o ambiente não tinha encoder disponível; é
  uma conversão manual única (squoosh.app ou similar), sem precisar de build.
- `cache-insight` só aparece porque o `python -m http.server` não manda
  `Cache-Control`. Numa hospedagem estática com cache longo em `/assets`,
  resolve sozinho.
- **Inlinar o CSS** no `<head>` elimina a requisição bloqueante. Como é página
  única, não há cache de CSS compartilhado a perder.

## Conformidade (CFM)

O conteúdo segue a Resolução CFM 1.974/2011 e o Código de Ética Médica:

- **sem depoimentos de pacientes** (Art. 118 do CEM veda);
- sem antes/depois, sem promessa de resultado, sem preço como chamariz;
- nome, especialidade e CRM/RQE visíveis no hero e no rodapé;
- linguagem informativa nos serviços, e aviso de que o site não substitui
  consulta médica.

Vale uma revisão final da médica antes de publicar.

---

## Pendências antes de publicar

1. **Texto da seção "Sobre".** Está marcado com `<!-- REVISAR -->` no HTML:
   formação, residência, títulos e abordagem precisam ser validados.
2. **Endereço da Itorax.** Não consta no guia de marca; o card está marcado com
   `<!-- PENDENTE -->` e hoje traz só os telefones.
3. **Revisar as áreas de atuação** — a lista atual é a pauta clássica de
   pneumologia adulta e deve ser ajustada ao que ela realmente atende.
4. ~~**Domínio.**~~ Resolvido: `www.dralorenafecury.com.br` está no ar e fixado
   no `CNAME`. Se um dia mudar, trocar em `index.html` (canonical, Open Graph,
   JSON-LD), `robots.txt`, `sitemap.xml` e `CNAME`.
5. **CTA principal.** O botão do hero, o flutuante e o CTA final apontam para o
   WhatsApp das **Clínicas Premium** ((98) 99240-7110), por ser a unidade com
   endereço completo no guia. Confirmar se é a unidade preferida para o primeiro
   contato — cada clínica também tem seu próprio botão na seção "Onde atendo".
6. **Convênios.** A resposta do FAQ hoje remete à secretaria. Se houver lista
   definida de convênios, vale explicitar.
7. **Revisão do Figma ficou parcial.** A conta atingiu o limite de chamadas do
   MCP (plano Starter) durante a revisão. Ficou confirmado o que importa para o
   site — marca nova, paleta e tipografia inalteradas — mas não deu para abrir um
   a um os outros nós novos (as variantes de lockup `113:1663`/`113:1665`,
   as marcas `113:1667`–`113:1670` e os grupos novos nos mockups de cartão).
   Vale uma olhada quando o limite liberar.
