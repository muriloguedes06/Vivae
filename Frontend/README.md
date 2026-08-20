# Frontend do Vivaê

Interface da plataforma de eventos e ingressos Vivaê, construída com React,
TypeScript e Vite.

O Frontend oferece experiências diferentes para clientes, organizadores e
usuários da portaria, consumindo exclusivamente a API do Backend.

## Tecnologias

- React 19;
- TypeScript;
- Vite;
- React Router DOM;
- Axios;
- qrcode.react;
- CSS responsivo próprio.

## Instalação

Primeiro, inicie o Backend seguindo `../Backend/README.md`.

Depois execute:

```bash
cd Frontend
npm install
npm run dev
```

A aplicação será disponibilizada em:

```text
http://localhost:5173
```

## Comandos

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Integração com o Backend

O Axios utiliza o prefixo relativo:

```text
/api
```

Durante o desenvolvimento, o Vite encaminha essas requisições para:

```text
http://localhost:3000
```

Exemplo:

```text
Frontend: /api/auth/login
Backend:  http://localhost:3000/auth/login
```

Essa configuração permite utilizar somente um túnel HTTPS ao testar a câmera
em um celular. O Backend não precisa ser exposto em outro endereço público.

## Estrutura

```text
src/
├── api/
│   ├── api.ts
│   └── connect.ts
├── assets/
├── components/
├── data/
├── hooks/
├── pages/
├── types/
├── utils/
├── App.tsx
├── main.tsx
└── styles.css
```

### `api`

Centraliza o Axios, os endpoints consumidos e a renovação automática do access
token.

### `components`

Contém componentes reutilizáveis, como cabeçalho, cards, campos de formulário,
menu do organizador, mapa de assentos e proteção de rotas.

### `hooks`

Agrupa carregamento de eventos, catálogos, ingressos, câmera, seleção de
assentos e contagem regressiva da reserva.

### `pages`

Contém as páginas organizadas por fluxo:

- autenticação;
- eventos públicos;
- compra e checkout;
- ingressos;
- organizador;
- portaria.

### `types`

Define os formatos compartilhados pelos componentes, páginas e respostas da
API.

### `utils`

Reúne formatação, conversão dos eventos externos e armazenamento temporário da
seleção de compra.

## Rotas

### Públicas

| Rota | Página |
| --- | --- |
| `/eventos` | Eventos locais publicados |
| `/eventos/:id` | Detalhes de um evento |
| `/login` | Login |
| `/criar-conta` | Cadastro de cliente |
| `/ingresso-compartilhado/:shareToken` | Ingresso acessado por link público |

Usuários autenticados não podem voltar para login ou cadastro enquanto a sessão
estiver válida.

### Autenticadas

| Rota | Página |
| --- | --- |
| `/ingressos?eventId=:id` | Seleção por quantidade |
| `/assentos?eventId=:id` | Seleção de assentos |
| `/checkout?eventId=:id` | Pagamento simulado |
| `/sucesso?ticketId=:id` | Confirmação do pagamento |
| `/meus-ingressos` | Ingressos do usuário |
| `/ingresso-digital?ticketId=:id` | Detalhe protegido do ingresso |

### Organizador

Disponíveis para `ORGANIZER` e `ADMIN`:

| Rota | Página |
| --- | --- |
| `/organizador` | Dashboard |
| `/organizador/eventos` | Gerenciamento dos eventos |
| `/organizador/catalogo` | Ticketmaster e TMDb |
| `/organizador/configurar` | Criação ou edição de evento |

### Portaria

Disponíveis para `GATE_STAFF` e `ADMIN`:

| Rota | Página |
| --- | --- |
| `/portaria` | Seleção do evento e leitura do ingresso |
| `/portaria/resultado` | Resultado da validação |

## Autenticação

O login salva no `localStorage`:

- `accessToken`;
- `refreshToken`;
- informações básicas do usuário.

O interceptor do Axios envia o access token em todas as requisições. Quando o
Backend responde `401`, ele tenta renovar os tokens uma vez e repete a chamada
original.

Se a renovação falhar, a sessão local é apagada e o usuário volta para o login.

## Proteção por cargos

O componente `RoleProtectedRoute` consulta:

```http
GET /users/informations
```

O cargo retornado decide se a página pode ser aberta. A proteção do React existe
para controlar a navegação; as rotas sensíveis também devem ser protegidas no
Backend.

## Eventos públicos

A página `/eventos` consome somente eventos locais publicados, e não os
resultados externos diretamente.

Recursos disponíveis:

- pesquisa por título;
- sincronização da busca com a URL;
- filtro por categoria;
- filtro por cidade;
- filtro por data;
- faixa de preço;
- paginação visual com “Mostrar mais”;
- detalhes com descrição, local, data e preço;
- redirecionamento para quantidade ou assentos conforme o evento.

## Área do organizador

O organizador pode:

- acompanhar eventos, capacidade, vendas e receita estimada;
- navegar no catálogo da Ticketmaster;
- navegar nos filmes da TMDb;
- pesquisar nos dois catálogos;
- importar uma referência externa;
- definir título, descrição, data, endereço, preço e capacidade;
- escolher publicação ou rascunho;
- criar mapa de assentos para filmes;
- editar eventos sem vendas iniciadas;
- excluir eventos sem histórico comercial.

Os itens externos são apenas referências. A venda acontece somente depois da
criação de um evento local.

## Reserva e compra

O projeto suporta dois fluxos.

### Quantidade

Usado em eventos com `GENERAL_ADMISSION`, como pista e VIP. O cliente escolhe a
quantidade de cada tipo de ingresso.

### Assentos

Usado em eventos com `RESERVED_SEATING`. O cliente escolhe lugares disponíveis
no mapa, com limite total de seis ingressos.

O Frontend envia somente IDs e quantidades. O preço exibido é usado no resumo
visual, mas o Backend consulta novamente os valores e calcula o total seguro.

A seleção temporária é mantida no `sessionStorage` até o checkout.

## Pagamento simulado

O checkout oferece aprovação e recusa sem cobrança financeira real.

Cartão aprovado:

```text
Nome: Murilo Guedes
Número: 4242 4242 4242 4242
Validade: 01/35
CVV: 426
```

Qualquer combinação diferente contempla a recusa.

Depois da aprovação, o Backend devolve os ingressos emitidos, e o Frontend abre
o primeiro deles usando seu `ticketId`.

## Meus ingressos e compartilhamento

`/meus-ingressos` lista somente registros pertencentes ao usuário autenticado.

O ingresso digital apresenta:

- evento;
- data e local;
- participante;
- tipo de ingresso;
- assento, quando existir;
- código manual;
- QR Code.

O QR contém o `qrToken`. O código curto `VIV-...` é mostrado separadamente para
digitação na portaria.

O botão de compartilhamento cria uma URL pública baseada em `shareToken`:

```text
/ingresso-compartilhado/:shareToken
```

O destinatário pode abrir essa página sem possuir conta.

## Portaria

O operador seleciona o evento atendido antes de validar um ingresso. Isso
permite ao Backend identificar um ingresso pertencente ao evento errado.

Em celulares e tablets:

- o navegador solicita permissão para usar a câmera;
- a câmera traseira é priorizada;
- o leitor procura QR Codes;
- a lanterna é oferecida quando suportada;
- a digitação manual continua disponível.

Em computadores, a interface apresenta diretamente a digitação do código.

Resultados apresentados:

- ingresso válido;
- código inválido;
- ingresso já utilizado;
- ingresso de outro evento;
- ingresso ou evento cancelado.

## Testando a câmera com ngrok

A câmera do navegador exige HTTPS quando a aplicação não está em `localhost`.

Com Backend e Frontend ativos, execute:

```bash
ngrok http 5173
```

Abra no celular a URL `https://...ngrok-free.app` fornecida pelo ngrok.

Se o Vite bloquear o hostname, substitua `server.allowedHosts` em
`vite.config.ts` pelo novo domínio e reinicie o Frontend.

O domínio do ngrok muda quando o túnel gratuito é recriado. O domínio presente
no repositório representa apenas o último teste realizado.

## Dados de demonstração

Execute o seed pelo Backend:

```bash
cd ../Backend
npx prisma db seed
```

Senha de todas as contas:

```text
Teste@123
```

| Cargo | E-mail |
| --- | --- |
| Organizador | `organizador@vivae.test` |
| Cliente 1 | `cliente1@vivae.test` |
| Cliente 2 | `cliente2@vivae.test` |
| Portaria | `portaria@vivae.test` |

O seed também cria um filme publicado com 40 assentos.

## Build e lint

Antes de enviar alterações:

```bash
npm run build
npm run lint
```

## Limitações conhecidas

- não existe atualização de assentos por WebSocket;
- a câmera depende do suporte do navegador a `BarcodeDetector`;
- a lanterna depende do dispositivo e do navegador;
- o endereço gratuito do ngrok não é permanente;
- não existem testes automatizados do Frontend;
- não existe deploy permanente.

O estado geral da aplicação e as instruções dos dois projetos estão documentados
no `../README.md`.
