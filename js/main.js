// https://stackoverflow.com/questions/31413749/node-js-promise-all-and-foreach

const container_personagens = document.getElementById('container-personagens')
const indice_pagina = document.getElementById('indice-pagina')
const pesquisar = document.getElementById('pesquisar')
const entrada = document.getElementById('entrada')
const modal_item = document.getElementById('modal-item')
const navbar = document.getElementById('navbar')
const container_pesquisa = document.getElementById('container-pesquisa')

var recurso_atual = ''

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

const indicePagina = (dados) => {
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
            <button type="button" class="btn ${i == pagina_atual ? "disabled" : ''}" data-indice="${i}"><strong data-indice="${i}">${i}</strong></button>
            `
        }
    }
    return indices
}

const spinnerCarregamento = (spinner) => {
    spinner.innerHTML = 
    `
    <div class="d-flex justify-content-center">
        <div class="spinner-border" role="status">
        </div>
    </div>
    `
}

const lista_secao_modal = async (chave) => {
    const dados_item_lista = await Promise.all(chave.map(url => fetchSwapi(url)))
    let item_lista = ''

    if(dados_item_lista.length > 0){
        dados_item_lista.map(item => item.name ? item_lista += `<li>${item.name}</li>` : item_lista += `<li>${item.title}</li>`)
        return item_lista
    }
    return 'N/A'
}

pesquisar.addEventListener('click', evento => {
    evento.preventDefault()
    const termo = entrada.value.trim()

    !termo ? listarPersonagens() : listarPersonagens(`/?search=${termo}`)
})

container_personagens.addEventListener('click', async evento => {
    spinnerCarregamento(modal_item)
    const alvo = evento.target
    const url_item = alvo.getAttribute('data-url-item')
    const dado_item = await fetchSwapi(url_item)
    const planeta_natal = await fetchSwapi(dado_item.homeworld)
    const naves = await lista_secao_modal(dado_item.starships)
    const veiculos = await lista_secao_modal(dado_item.vehicles)
    const filmes = await lista_secao_modal(dado_item.films)

    const dados_especies = await Promise.all(dado_item.species.map(url => fetchSwapi(url)))
    let string_especies = ''

    if(dados_especies.length > 0)
        string_especies = dados_especies.map(item => item.name).join(', ')
    else
        string_especies = 'N/A'

    const conteudo = `
    <div class="modal-header">
        <h5 class="modal-title">${dado_item.name}</h5>
        <button type="button" class="btn" data-bs-dismiss="modal"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF0000"><path d="M0 0h24v24H0V0z" fill="none" opacity=".87"/><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm4.3 14.3c-.39.39-1.02.39-1.41 0L12 13.41 9.11 16.3c-.39.39-1.02.39-1.41 0-.39-.39-.39-1.02 0-1.41L10.59 12 7.7 9.11c-.39-.39-.39-1.02 0-1.41.39-.39 1.02-.39 1.41 0L12 10.59l2.89-2.89c.39-.39 1.02-.39 1.41 0 .39.39.39 1.02 0 1.41L13.41 12l2.89 2.89c.38.38.38 1.02 0 1.41z"/></svg></button>
    </div>
    <div class="modal-body">
        <div class="secao-modal">
            <h6>-- Dados Pessoais --</h6>
            <ul>
                <li><span>Altura:</span> ${dado_item.height}</li>
                <li><span>Peso:</span> ${dado_item.mass}</li>
                <li><span>Ano de Nascimento:</span> ${dado_item.birth_year}</li>
                <li><span>Genero:</span> ${dado_item.gender}</li>
                <li><span>Planeta Natal:</span> ${planeta_natal.name}</li>
                <li><span>Especie:</span> ${string_especies}</li>
            </ul>
        </div>
        <div class="secao-modal">
            <h6>-- Naves --</h6>
            <ul>
                ${naves}
            </ul>
        </div>
        <div class="secao-modal">
            <h6>-- Veiculos --</h6>
            <ul>
                ${veiculos}
            </ul>
        </div>
        <div class="secao-modal">
            <h6>-- Filmes --</h6>
            <ul>
                ${filmes}
            </ul>
        </div>
    </div>
    `
    modal_item.innerHTML = conteudo
})

navbar.addEventListener('click', evento => { 
    const alvo = evento.target
    const recurso = alvo.getAttribute('data-recurso')

    document.getElementById('container-pesquisa').style.display = "block";

    if(recurso === "personagens"){
        recurso_atual = 'Personagens'
        listarPersonagens()
    }
})

indice_pagina.addEventListener('click', evento => {
    const alvo = evento.target
    let indice = alvo.getAttribute('data-indice')
    window[`listar${recurso_atual}`](`?page=${indice}`);
})

async function listarPersonagens (complemento = '') {
    spinnerCarregamento(container_personagens)
    const dados = await fetchSwapi(`${url_base}/people/${complemento}`)
    container_personagens.innerHTML = criarLista(dados)
    indice_pagina.innerHTML = indicePagina(dados)
}