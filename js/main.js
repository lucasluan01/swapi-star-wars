const container_personagens = document.getElementById('container-personagens')

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
            <span>${dados.results[i].name}</span>
            <span>Ver mais</span>
        </button>
        `
    }
    return lista
}

const listarPersonagens = async (complemento = 'people') => {
    const dados = await fetchSwapi(`${url_base}${complemento}`)
    
    container_personagens.innerHTML = criarLista(dados)
}

listarPersonagens()