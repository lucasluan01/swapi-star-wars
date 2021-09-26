const container_personagens = document.getElementById('container-personagens')
const indice_pagina = document.getElementById('indice-pagina')

const url_base = "https://swapi.dev/api/"

const fetchSwapi = async url => {
    const response = await fetch(url)
    const dados = await response.json()
    return dados
}

const criarLista = dados => {
    let lista = ''

    for (let i = 0; i < dados.results.length; i++) {
        lista += `
        <button type="button" class="btn list-group-item" id="item-lista">
            <span>${dados.results[i].name || dados.results[i].title}</span>
            <span>Ver mais</span>
        </button>
        `
    }
    return lista
}

const indicePagina = (dados, metodo) => {
    let total = Math.ceil(dados.count / 10)
    let pagina_atual = 0
    let indices = ''
    let complemento = ''

    if (dados.next) {
        pagina_atual = dados.next[dados.next.length - 1] - 1
        complemento = dados.next.split('api/')[1]
    }
    else if (dados.previous) {
        pagina_atual = parseInt(dados.previous[dados.previous.length - 1]) + 1
        complemento = dados.previous.split('api/')[1]
    }
    complemento = complemento.substring(0, complemento.length - 1)

    if(dados.next || dados.previous)
    {
        for (let i = 1; i <= total; i++) {
            indices += `
            <button type="button" class="btn ${i == pagina_atual ? "disabled" : ''}" onclick="${metodo}('${complemento}${i}')"><strong>${i}</strong></button>
            `
        }
    }
    return indices
}

const listarPersonagens = async (complemento = 'people') => {
    const dados = await fetchSwapi(`${url_base}${complemento}`)
    container_personagens.innerHTML = criarLista(dados)
    indice_pagina.innerHTML = indicePagina(dados, 'listarPersonagens')
}