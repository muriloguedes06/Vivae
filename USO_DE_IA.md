# Uso de inteligência artificial

Este documento registra de forma transparente como ferramentas de inteligência
artificial foram utilizadas durante o desenvolvimento do Vivaê.

## Google Stitch

O Google Stitch foi utilizado para gerar as referências visuais e os HTMLs
iniciais. Esse material serviu como ponto de partida para o design.

A aplicação final não executa os HTMLs gerados. As telas foram analisadas e
convertidas manualmente para React com TypeScript. Durante essa conversão:

- o HTML foi dividido em páginas e componentes reutilizáveis;
- comportamentos estáticos foram transformados em estados e hooks React;
- as páginas receberam rotas com React Router;
- os dados foram tipados com interfaces TypeScript;
- animações e responsividade foram preservadas e refinadas;
- chamadas HTTP foram centralizadas com Axios;
- autenticação, cargos, paginação, filtros e estados de erro foram integrados;
- o fluxo visual foi adaptado às regras reais do domínio de ingressos.

O Google Stitch foi usado como ferramenta de concepção visual. A estrutura, a
componentização, a integração e a lógica da aplicação React foram implementadas
no projeto durante o desenvolvimento.

## Codex

O Codex foi utilizado de forma pontual como ferramenta de apoio para:

- implementar o consumo das APIs externas no Frontend;
- investigar erros encontrados durante o desenvolvimento;
- ajudar a produzir a documentação do projeto.

As decisões de arquitetura, regras de negócio, tecnologias, escopo, identidade
visual e experiência das telas foram escolhidas e guiadas por mim. Eu conduzi o
desenvolvimento, defini o que deveria ou não fazer parte da solução, testei os
fluxos e adaptei o código para que ele permanecesse compatível com meu nível de
conhecimento e pudesse ser explicado durante a avaliação.

Portanto, a inteligência artificial foi usada como apoio ao processo, e não
como responsável pela concepção ou autoria integral da aplicação.
