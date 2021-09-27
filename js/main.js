// https://stackoverflow.com/questions/31413749/node-js-promise-all-and-foreach

const container_personagens = document.getElementById('container-personagens')
const indice_pagina = document.getElementById('indice-pagina')
const pesquisar = document.getElementById('pesquisar')
const entrada = document.getElementById('entrada')
const modal_item = document.getElementById('modal-item')

const url_base = "https://swapi.dev/api/"

const fetchSwapi = async url => {
    const response = await fetch(url)
    const dados = await response.json()
    return dados
}

const criarLista = dados => {
    let lista = ''

    if(dados.count)
    {
        for (let i = 0; i < dados.results.length; i++) {
            lista += `
            <button id="item-lista" type="button" class="btn list-group-item" data-url-item="${dados.results[i].url}" data-bs-toggle="modal" data-bs-target="#modal"">
                <span>${dados.results[i].name || dados.results[i].title}</span>
                <span>Ver mais</span>
            </button>
            `
        }
    }
    else
        lista = '<span id="erro-pesquisa">Nenhum dado foi encontrado.</span>'
    return lista
}

const indicePagina = (dados, metodo) => {
    let total = Math.ceil(dados.count / 10)
    let pagina_atual = 0
    let indices = ''
    let complemento = ''

    if (dados.next) {
        pagina_atual = dados.next[dados.next.length - 1] - 1
        complemento = dados.next.split('/')[5]
    }
    else if (dados.previous) {
        pagina_atual = parseInt(dados.previous[dados.previous.length - 1]) + 1
        complemento = dados.previous.split('/')[5]
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

pesquisar.addEventListener('click', evento => {
    evento.preventDefault()
    const termo = entrada.value.trim()

    !termo ? listarPersonagens() : listarPersonagens(`/?search=${termo}`)
})

container_personagens.addEventListener('click', async evento => {
    const alvo = evento.target
    const url_item = alvo.getAttribute('data-url-item')
    const dado_item = await fetchSwapi(url_item)
    const planeta_natal = await fetchSwapi(dado_item.homeworld)

    const dados_naves = await Promise.all(dado_item.starships.map(url => fetchSwapi(url)))
    let string_naves = ''

    if(dados_naves.length > 0)
        dados_naves.map(item => { string_naves += `<li>${item.name}</li>` })
    else
        string_naves = 'Nenhuma nave definida'



    const dados_especies = await Promise.all(dado_item.species.map(url => fetchSwapi(url)))
    let string_especies = ''

    if(dados_especies.length > 0)
        string_especies = dados_especies.map(item => item.name).join(', ')
    else
        string_especies = 'Nenhuma espécie definida'
    


    const dados_veiculos = await Promise.all(dado_item.vehicles.map(url => fetchSwapi(url)))
    let string_veiculos = ''

    if(dados_veiculos.length > 0)
        dados_veiculos.map(item => { string_veiculos += `<li>${item.name}</li>` })
    else
        string_veiculos = 'Nenhum veículo definido'


        
    const dados_filmes = await Promise.all(dado_item.films.map(url => fetchSwapi(url)))
    let string_filmes = ''

    if(dados_filmes.length > 0)
        dados_filmes.map(item => { string_filmes += `<li>${item.title}</li>` })
    else
        string_filmes = 'Nenhum filme definido'
    



    const conteudo = `
    <div class="modal-header">
        <h5 class="modal-title">${dado_item.name}</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal""></button>
    </div>
    <div class="modal-body">
        <div class="secao-modal">
            <h6>DADOS PESSOAIS</h6>
            <ul>
                <li><span>Altura:</span> ${dado_item.height}</li>
                <li><span>Peso:</span> ${dado_item.mass}</li>
                <li><span>Ano de Nascimento:</span> ${dado_item.birth_year}</li>
                <li><span>Gênero:</span> ${dado_item.gender}</li>
                <li><span>Planeta Natal:</span> ${planeta_natal.name}</li>
                <li><span>Espécie:</span> ${string_especies}</li>
            </ul>
        </div>
        <div class="secao-modal">
            <h6>NAVES</h6>
            <ul>
                ${string_naves}
            </ul>
        </div>
        <div class="secao-modal">
            <h6>VEÍCULOS</h6>
            <ul>
                ${string_veiculos}
            </ul>
        </div>
        <div class="secao-modal">
            <h6>FILMES</h6>
            <ul>
                ${string_filmes}
            </ul>
        </div>
    </div>
    `
    modal_item.innerHTML = conteudo
})

const listarPersonagens = async (complemento = '') => {
    const dados = await fetchSwapi(`${url_base}/people/${complemento}`)
    container_personagens.innerHTML = criarLista(dados)
    indice_pagina.innerHTML = indicePagina(dados, 'listarPersonagens')
}