# Lista de Mudanças

## Versão 1.4.211
- Corrigido: Condições com ofic impediam que a ficha abrisse.
- Corrigido: Algumas Condições tiveram seu efeito atualizado.
- Corrigido: Cálculo de Distância Diagonal atualizado para as mudanças V12.

## Versão 1.4.210
- Corrigido: Efeitos com variáveis de personagem quebravam a ficha (Agora também na v11)
- Corrigido: Efeitos não eram transferidos para as poções.

## Versão 1.4.209
- Corrigido: Efeitos aplicados em items específicos não apareciam.
- Corrigido: Efeitos com variáveis de personagem quebravam a ficha.
- Corrigido: Aplicação Dano/Recuperação de PM.

## Versão 1.4.208
- Corrigido: Efeitos de Uso com Items Especificos estavam aparecendo sempre.
- Corrigido: Pequenos ajustes visuais da v12.

## Versão 1.4.207
- Corrigido: Efeitos no compêndio com imagens quebradas

## Versão 1.4.206
- Atualizado: Compatibilidade com V12;
- Corrigido: Bug ao gerar Poções.
- Corrigido: Resistência a `dano` é aplicada uma unica vez, não mais somada aos outros tipos de dano.

## Versão 1.4.205
- Corrigido: Incluir uma magia na ficha de um npc impedia que ela fosse aberta.

## Versão 1.4.204
- Corrigido: Poder Racial de Medusas Natureza Veneno, bônus em testes de resistência contra veneno;
- Adicionado: Configuração Exibir Magias Compactas para a ficha de Ameaças, permitindo mostrar somento o nome ou o resumo de como é usada.
- Atualizado: O Parser de Ficha de Ameaça não é mais Case Sensitive.

## Versão 1.4.203
- Atualizado: Perícias de Ameaças usam o cálculo padrão, exceto ataques e resistências;
- Atualizado: Rolagem de Ataque das Armas de Ameaças possuem o campo de perícia para propósito de calcular modificadores e condições.
- Atualizado: Ameaças do Compêndio tiveram suas perícias corrigidas para o novo cálculo.
- Corrigido (Eu acho): Efeito de uso de `@Golpe Divino#dano`;
- Corrigido: Armadura pesada não soma o atributo caso seja negativo.
- Corrigido: Aplicar dano pelo menu de contexto de um mensagem não identificava rolagem de dano com d20;
- Adicionado: Aplicar dano pelo menu de contexto exibira um popup de seleção de rolagem quando mais de uma rolagem de dano for identificada.
- Adicionado: Resistencia a Dano Excecão - Casos como 10/luz reduz dano de todas as fontes exceto luz;
- Adicionado: Atributo de Carga pode ser alterado com `system.attributes.carga.atributo` `Sobrepor` `des`;
- Adicionado: Em efeitos de uso `danoCritico` `Adicionar` `10` adiciona um bônus de dano somente quando o ataque é um acerto crítico;
- Adicionado: Campos de texto pra deslocamento, ataques corpo-a-corpo / à distância para Ameaças;
- Adicionado: Configuração de Lancinante, escolher se quer a multiplicação do Livro Básico (Qualquer valor numérico) ou do Ameaças (O valor do lancinante);
- Adicionado: Configuração para inverter a Configuração de Uso, com shift não exibe o menu, sem shift exibe o menu.
- Adicionado: Configuração de Melhor/Pior de dois Dados no menu de Configuração de Uso.

## Versão 1.4.202
- Corrigido: Adicionar/Apagar Partes um uma rolagem de item;
- Corrigido: Apagar Perícias de Oficios/Customizadas;
- Corrigido: Descrição de Condições no Chat;
- Corrigido: Textos desatualizados e a falta do Ramo Verdejante;

## Versão 1.4.201
- Corrigido: Condições Especiais (cego, invisível) não estavam aplicando o efeito especial de visão e detecção;
- Corrigido: O ícone das condições Enfeitiçãdo e Sustentado impediam a Cena de carregar no Firefox;
- Corrigido: Configuração de Imunidades a Condições não estava abrindo;

## Versão 1.4.200
- Atualizado: Compatibilidade com V11;
- Corrigido: Criar Pergaminho não copiava os Efeitos e Aprimoramentos;

## Versão 1.4.116
- Corrigido: Bug em Efeitos de Uso que Adicionam Dados e Aumentavam a Quantidade;
- Corrigido: Menu de Itens Empunhados/Vestidos ficava cortado nos limites da ficha de abas.

## Versão 1.4.115
- Corrigido: Alguns Efeitos de Uso que alteravam características causavam erro.
- Corrigido: Campos de Itens Empunhados/Vestidos não haviam sido migrados corretamente e impediam que fichas abrisse.
- Corrigido: Exibição de resistência a condições e efeitos em fichas de NPC.
- Corrigido: A soma dos espaços não era arredondada corretamente.

## Versão 1.4.114
- Corrigido: Efeitos de Uso de dano numérico haviam quebrado.

## Versão 1.4.113
- Atualizado: Tabelas de Tesouro.
- Corrigido: Efeitos com `.???.` causavam erro no cálculo de PV/PM.
- Corrigido: Efeitos de itens equipáveis não eram ativados com a nova opção de Controle de Itens Empunhados/Vestidos.
- Corrigido: Poderes, Itens e Magias com informações divergentes entre a 1ª versão da edição JdA e mais atual.

## Versão 1.4.112
- Adicionado: RD Calculável. O campo `system.tracos.resistencias.###.bonus` pode receber bônus de váriaveis (ex: `@con`).
- Adicionado: Atributo Racial. O campo `system.atributos.###.racial` é usado no cálculo do valor final do atributo e no cálculo de PV/PM.
- - Há uma conifguração na ficha para exibir o campo.
- Adicionado: Controle de Itens Empunhados/Vestidos.
- - Efeitos podem aumentar a quantidade que pode ser equipado com `system.equipamentos.limiteEmpunhado` e `system.equipamentos.limiteVestido`;
- Atualização: Efeitos de Poderes Raciais de Atributo e Aumento de Atributo devem usar o campo `system.atributos.###.racial` para afetar o cálculo de PV/PM.
- Atualização: Texto das Condições com atulizações do JdA.
- Atualização: Items não Carregados. O item aparecerá com um ícone de baú e transparência. (Felipe Constantino)
- Corrigido: Passos de Dano. Suporte para dano base 2d8 e 2d10 (Vítor Barcellos)
- Corrigido: Exibição do diário na ficha de PdM.
- Corrigido: Ordem das colunas na janela de configuração de PV/PM.
- Corrigido: Campo de Item Especifico do Dedo Verde, Sombras Profanas, Saqueador de Tumbas, Mente Criminosa.
- Corrigido: Efeito de Uso de Arremessador, Raio Arcano e Raio Poderoso.
- Corrigido: Textos de poderes desatualizados.

## Versão 1.4.111
- Corrigido: Efeitos que aumentavam a quantidade de dados estava concatenando.

## Versão 1.4.110
- Atualização: Macro de descanso e botão de descanso na ficha.
- Atualização: Configuração de PV/PM movido para perto dos campos.
- Adicionado: Configuração de PV/PM Manual.
- Corrigido: Realce em Testes com resultado Critico e Falha.
- Corrigido: Efeito de Reroll `r<2` não estava funcionando.
- Corrigido: Itens que alteravam carga mas adicionavam apenas metade.
- Corrigido: Links se mantinham como Link quando um texto era editado, impossibilitando sua edição e perdendo sua conexão com o item.

## Versão 1.4.109
- Corrigido: Ao usar itens com rolagem vazia causava erro.
- Corrigido: Erro ao aplicar Efeitos de uso quando nome está errado.

## Versão 1.4.102 a 1.4.108
- Corrigido: Perícias - atualizar treino alterava atributo e vice-versa;
- Corrigido: Perícias - efeitos acumulavam infinitamente sempre que a ficha atualizava;
- Corrigido: Perícias - efeitos de condição não eram removidos com as condições;
- Corrigido: Items - Alguns Equipamentos não somavam penalidade de armadura;
- Corrigido: Condições - Esmorecido e Frustrado afetavam perícias erradas;
- Corrigido: Ajustes em alguns poderes;

## Versão 1.4.101
- Atualização: Tormenta20 Versão Jogo do Ano;
- Atualização: Compêndios Atualizados. Agradecimentos a @eunaumtenhoid, @Gustavo Reis, @nightflight, @MrRavnark e @FalArthur

## Versão 1.4.005
- Corrigido: Fichas não abriam por erro na descrição de itens;
- Corrigido: Soltar uma classe que o personagem já possuía não atualizava o nivel;
- Corrigido: Foundry criava uma macro de exibição em cima da macro de item;
- Corrigido: Magias na Ficha de Abas não apresentavam o ícone de favoritar;
- Corrigido: Cálculo de RollData de poderes por tipo, ajustado pra ser mais abrangente e funcionar com Poderes de Distinções, além de Poderes da Tormenta (TODO: Alterar no futuro, possivelmente criando um campo Tag nos itens);
- Adicionado: [Protótipo] DataModels - a nova maneira de registrar e migrar as estruturas de dados dos Personagens e Itens;
    - PARA TESTAR, DETECTAR BUGS E COLHER FEEDBACK;
    - Essa configuração pode causar a perda de informações em Personagens e Itens;
    - Personagens e Itens que não estejam de acordo com a estrutura estabelecida não serão exibidos, mas continuam existindo;

## Versão 1.4.003 a 1.4.004
- Corrigido: Diversas correções;

## Versão 1.4.002
- Atualização: compatibilidade com o FoundryVTT v10
- Adicionado: Ajustes nos cálculos de Ameaças seguindo a Reforma Monstrográfica;
- Adicionado: Redução de dano para todos os tipos de dano e mensagem de dano foi atualizada;
- Adicionado: Recursos, campos de controle para recursos secundários e recursos de Skyfall (Pontos de Sombra, Catarse, e falhas na Morte)
- Adicionado: Nova categoria de ActiveEffects 'Efeitos de Uso Temporários';
- Adicionado: Efeitos de Uso podem ser aplicados em rolagens de itens específicos;
- Adicionado: A duração do efeito de um Item deve ser aplicada no efeito que ele gera;
- Adicionado: [Protótipo] Efeitos `sustentando` e `dano` que ativam no inicio do turno;
- Adicionado: [Protótipo] Efeito de Uso permite escolher uma arma especifica a ser aplicada `?.items.arma`, como Arma Mágica;

## Versão 1.4.005
- Corrigido: Fichas não abriam por erro na descrição de itens;
- Corrigido: Soltar uma classe que o personagem já possuía não atualizava o nivel;
- Corrigido: Foundry criava uma macro de exibição em cima da macro de item;
- Corrigido: Magias na Ficha de Abas não apresentavam o ícone de favoritar;
- Corrigido: Cálculo de RollData de poderes por tipo, ajustado pra ser mais abrangente e funcionar com Poderes de Distinções, além de Poderes da Tormenta (TODO: Alterar no futuro, possivelmente criando um campo Tag nos itens);
- Adicionado: [Protótipo] DataModels - a nova maneira de registrar e migrar as estruturas de dados dos Personagens e Itens;
    - PARA TESTAR, DETECTAR BUGS E COLHER FEEDBACK;
    - Essa configuração pode causar a perda de informações em Personagens e Itens;
    - Personagens e Itens que não estejam de acordo com a estrutura estabelecida não serão exibidos, mas continuam existindo;

## Versão 1.4.003 a 1.4.004
- Corrigido: Diversas correções;

## Versão 1.4.002
- Atualização: compatibilidade com o FoundryVTT v10
- Adicionado: Ajustes nos cálculos de Ameaças seguindo a Reforma Monstrográfica;
- Adicionado: Redução de dano para todos os tipos de dano e mensagem de dano foi atualizada;
- Adicionado: Recursos, campos de controle para recursos secundários e recursos de Skyfall (Pontos de Sombra, Catarse, e falhas na Morte)
- Adicionado: Nova categoria de ActiveEffects 'Efeitos de Uso Temporários';
- Adicionado: Efeitos de Uso podem ser aplicados em rolagens de itens específicos;
- Adicionado: A duração do efeito de um Item deve ser aplicada no efeito que ele gera;
- Adicionado: [Protótipo] Efeitos `sustentando` e `dano` que ativam no inicio do turno;
- Adicionado: [Protótipo] Efeito de Uso permite escolher uma arma especifica a ser aplicada `?.items.arma`, como Arma Mágica;

## Versão 1.3.0.20
- Corrigido: A atualização no cálculo de carga quebrava atualizações nas fichas de NPC;

## Versão 1.3.0.19
- Adicionado: Carga max pode ser alterada por efeitos `data.attributes.carga.max`;
- Adicionado: Regra Alternativa de carga por espaços da Dragão Brasil;
- Atualização: Algumas magias foram atualizados. (ft. Gustavo Reis, eunaumtenhoid);
- Atualização: Visual das mensagens do chat;
- Corrigido: aprimoramentos de passos;
- Corrigido: Rolar Iniciativa pela ficha não atualizava no combate;

## Versão 1.3.0.18
- Atualização: Diversos itens, poderes e magias foram atualizados. E um compendium de Tabelas de Tesouro foi adicionado. (Feitos pelo Gustavo Reis)

## Versão 1.3.0.16
- Corrigido: Dice So Nice mostrará os dados em rolagens para Si mesmo;

## Versão 1.3.0.15
- Atualização: Os dados 3D vão atrasar a mensagem no chat até que a animação seja concluída;
- Atualização: Correções de algumas magias e habilidades;
- Corrigido: Editor de Texto deve aparecer normalmente;
- Corrigido: Erro em rolagens com valores númerico;

## Versão 1.3.0.14
- Atualização: Classes com PV/PM por nível livres;
- Atualização: Chat deve exibir o tipo de dano junto ao dado;
- Corrigido: Clicar com o botão direito numa perícias volta a abrir o Journal dela;

## Versão 1.3.0.13
- Corrigido: Bug icone de template aparecendo em outra camada;
- Corrigido: Macro não é criada ao arrastar um item pra barra;

## Versão 1.3.0.12
- Atualização: Compatibilidade com a v9 do FoundryVTT;
- Adicionado: Barra de Vida Negativa;
- Corrigido: Bug do Icone de Templates aparecendo na Layer errada;
- Corrigido: Bug ao criar macro ao arrastar um item para a barra de macros;

## Versão 1.3.0.11
- Adicionado: opção de apagar mensagem no menu de contexto (BDM);
- Adicionado: `data.modificadores.dano.alq` aumentar efeito de itens alquimicos;
- Adicionado: configuração de mensagem de dano;
- Corrigido: macros de Sangramento e Confuso;
- Corrigido: spam de mensagem de condição quando aplicada em multiplos tokens;

## Versão 1.3.0.10
- Correção da mensagem no chat ao aplicar uma condição.

## Versão 1.3.0.9
- Macro de Condições por Tiago Morato;
- Macro de descanço;
- Config de ocultar CD de npcs;
- Campo Raças nos NPCS;
- Bug no cálculo de distância ao usar a régua.

## Versão 1.3.0.8
- Ajuste no tracker de iniciativa;

## Versão 1.3.0.7
- Atualização na rolagem de atributos e perícias para permitir a compatibilidade com as solicitações de rolagem do módulo Monk's TokenBar (O módulo ainda precisa aceitar uma atualização);

## Versão 1.2.0.21
### Novidades
- Navegador de Compêndio removido do sistema e transformado em um módulo. Manifesto para instalação: https://github.com/mclemente/compendium-browser/releases/latest/download/module.json.

## Versão 1.2.0.20
### Consertos de Bugs
- NPC: RD não sendo adicionado à ficha.
- PJ: Bug visual onde o Bônus de Treinamento mostrava +6 no nível 14.
- Efeitos Ativos: Bônus na Defesa do poder Reptiliano.

## Versão 1.2.0.19
### Novidades
- Efeitos Ativos:
- - Mais 11 Efeitos: Arcano de Batalha, Arma Sagrada, Armas da Ambição, Comandar, Derrubar/Desarmar/Quebrar Aprimorado, Magia Pungente, Mestre Caçador, Pele de Aço/Ferro
- - Removido o efeito do Foco em Arma. É melhor aplicar efeitos passivos para itens diretamente na ficha do item.
- Tentar ativar um efeito de uma mensagem no chat retornará um aviso para selecionar um token caso não tenha um selecionado.
- Compêndio: Armas de ataque à distância (exceto Arco Longo) não têm Força como atributo no dano.

### Consertos de Bugs
- Fichas de personagens com Armas sem Atributo definido com uma perícia definida não abriam.

## Versão 1.2.0.18
### Consertos de Bugs
- Fichas com RD Base ou Temporário definidos mas o outro indefinido não conseguiam editar a ficha (ex: Base "5", Temp "").
- Janela de Uso de Habilidade (Shift + Clique):
- - Perícias não estavam sendo afetadas pelo modificador da janela do shift.
- - Modo de rolagem estava sendo ignorado.
- - "Ataque" aparecia para habilidades que não eram ataques.

## Versão 1.2.0.17
### Novidades
- Botão ao lado do atributo chave de magia, para atualizar todas as magias presentes.
- Campo nos itens para incluir uma sub descrição no chat;

## Versão 1.2.0.16
### Novidades
- Mais 7 Efeitos Ativos: Ambidestria, Autoconfiança, Cura Pelas Mãos, Ervas Curativas, Foco em Arma, Saque Rápido e Sentidos Aguçados.
- Efeitos Ativos atualizados: Estilo de Uma Arma, Golpe Divino

## Versão 1.2.0.15
### Novidades
- Macros adicionadas: Confuso e Sangrando.

### Consertos de Bugs
- Ficha PJ: Ícones de preprar magia e equipar armadura agora mudam de cor normalmente.

## Versão 1.2.0.14
### Consertos de Bugs
- Revertido um bug gerado pela atualização 1.2.0.13, onde a ficha não carregaria corretamente.
- Rolar pericias através de macros voltam a funcionar.

## Versão 1.2.0.13
### Novidades
- Ficha de Abas: É possível equipar/desequipar um equipamento na seção de Favoritos.
- Mais 5 Efeitos Ativos: Atlético, Canalizar Reparos, Gatuno, Investigador (parcial), Urro Divino.
- Aprimoramentos de Magia: Escudo da Fé e Névoa.

## Versão 1.2.0.12
### Consertos de Bugs
- Icones de condição não apareciam no Firefox
- Itens sem dado podem receber efeitos que incluam com dado e modificar esses dados.
- Itens podem possuir valores fixos.
- Adicionado Tempo de Início para Efeitos com duração em segundos.
- Efeitos com duração cena aparecem corretamente como Efeitos Temporários.

## Versão 1.2.0.11
### Novidades
- Efeitos de Uso podem ser alternados para aplicar automaticamente, mesmo sem o SHIFT.
- Efeitos podem ser arrastados para a barra de macros, permitindo alternar entre Ativo/Inativo.

## Versão 1.2.0.10
### Consertos de Bugs
- Condições: voltam a funcionar como deveriam.
- Efeitos de Uso: Atributos (@car) podem ser aplicados no dano de armas.

## Versão 1.2.0.8-1.2.0.9
### Novidades
- Botão de Editar readicionado à ficha de PJ como uma opção. Vá no menu do personagem (Engrenagem) e marque a opção "Mostrar Botão de Editar Itens".

## Versão 1.2.0.6
### Consertos de Bugs
- Macros: não somavam corretamente os bônus;
### Em progresso
- Condições: desativadas devido a um bug crítico, solução em andamento;

## Versão 1.2.0.5
### Consertos de Bugs
- NPCs: Armas com Perícia com valor 0 adicionam o valor do Atributo. Afeta principalmente NPCs já criados e os do compêndio.
- Seta Infalível: Aprimoramentos que aumentavam o número de setas funciona corretamente em vez de adicionar ao valor original.

## Versão 1.2.0.4
### Novidades
- Mais 29 Efeitos Ativos: Arqueiro, Ataque Poderoso, Ataque Preciso, Combate Defensivo, Crítico Brutal, Disparo Rápido, Encouraçado, Esquiva, Estilo de Arma e Escudo, Estilo de Disparo, Estilo de Duas Armas, Estilo de Duas Mãos, Estilo de Uma Arma, Fanático, Golpe Pessoal, Inexpugnável, Inimigo de (Criatura), Magia Acelerada, Magia Ampliada, Magia Discreta, Marca da Presa, Mira Apurada, Ponto Fraco, Raio Elemental, Romper Resistências, Vigor Primal, Vitalidade e Vontade de Ferro.

### Consertos de Bugs
- Armas: Perícia com atributo diferente selecionado agora é calculada corretamente.

## Versão 1.2.0.3
### Consertos de Bugs
- Penalidade de Armadura é calculada normalmente.

## Versão 1.2.0.2
### Novidades
- NPC:
- - NPCs têm a lista de perícias como os PJ. Apenas as perícias com algum valor diferente de 0 aparecem fora do modo de edição.
- - Armas podem ter nenhum atributo no ataque.
- - Armas podem ter perícias no ataque.
- Armas:
- - Rolagens de ataque e dano não mostram somas de 0. Exemplo: `1d6 + 0 + 0` aparece apenas como `1d6`.
- - Armas sem dano, como a Rede, não mostram mais uma rolagem de dano zerada.

### Consertos de Bugs
- Armas: Atributo do Ataque funciona normalmente.

## Versão 1.2.0.0
### Novidades
- Efeitos Ativos adicionados. Mais informações de como usar [aqui](https://vizael.gitlab.io/tormenta20-fvtt/efeitos/efeitos/).
- Botão `Editar` e o livro com a descrição de perícia removido.
    - Clicar com o botão esquerdo sobre um item, poder ou magia na ficha do Personagem mostra a descrição do item. Para usar o item, clique no dado que aparece no lugar da imagem ao passar o mouse em cima.
    - Clicar com o botão direito sobre um item, poder, magia ou perícia na ficha do Personagem abre a descrição dele.
- Equipamentos que não são armaduras ou escudos agora contam diretamente na Defesa, e não como parte do bônus `Outros`.
- Equipamentos que não são armaduras ou escudos agora contam para a Penalidade de Armadura.

### Consertos de Bugs
- A ficha não rola mais para cima ao atualizar informações.

## Versão 1.1.57
### Novidades
- Itens: Bomba de Fumaça adicionada.
- Poderes: Libertade Irrestrita adicionada.

## Versão 1.1.56
### Consertos de Bugs
- Ficha NPC: Listas de perícias aparecem fora do modo de edição.

## Versão 1.1.55
### Novidades
- Agora todas as ameaças têm tokens.

### Consertos de Bugs
- Ameaças: Ajustado ataques de algumas criaturas e adicionado habilidades inatas dos aberrantes e mortos-vivos.
- Poções: Adicionado peso para as poções (0,5 kg).

## Versão 1.1.54
### Novidades
- Nome de habilidades do NPC indicam se a habilidade é Sustentada.
- Adicionado suporte ao módulo Bug Reporter. Agora é possível reportar bugs diretamente de dentro do Foundry, sem precisar criar uma conta no Gitlab, basta instalar o módulo.
- Ficha NPC: Listas de perícias ou equipamentos vazios são ocultados.
- Ficha NPC: Armas naturais não aparecem na lista de equipamentos fora do modo de edição.

### Consertos de Bugs
- Ameaças: Glop corrigido (estava com visão no escuro e sem imunidades).

## Versão 1.1.53
### Novidades
- A descrição de dano das armas nas fichas de personagens agora não faz cálculos, mostrando a fórmula atual do dano.

### Consertos de Bugs
- Lobo-Crocodilo não tem mais deslocamento de voo.

## Versão 1.1.52
### Novidades
- Ficha NPC: Campos de descrição Corpo a Corpo e À Distância adicionados. Agora é possíve colocar coisas como "2 garras" no NPC.
- Ficha NPC: Itens são listados na seção de Equipamentos.
- Ameaças: Descrição Corpo a Corpo e À Distância adicionados a todas as ameaças.

![image](/uploads/a6e1dd6fee00c5c7e39dcc3d38c479ba/image.png)

### Consertos de Bugs
- Rolagens com armas sem dano (ex: Rede) funcionam normalmente.
- Armas sem dano (ex: Rede) não mostram mais o dano na descrição em fichas de personagens.

## Versão 1.1.51
### Consertos de Bugs
- Ficha NPC: Conserto de um bug que não deixava fichas de NPCs serem abertas.

## Versão 1.1.50
### Novidades
- Fichas: O total da CD base das magias (10 + metade do nível + atributo-chave) agora é mostrado nas fichas.

### Consertos de Bugs
- NPCs: Imagens não são substituídas pelo padrão ao duplicar ou importar NPCs.

## Versão 1.1.49
### Novidades
- Ameaças: Tokens adicionados a algumas criaturas.
- Ameaças: Centauro e Centauxo Xamã adicionados.

## Versão 1.1.48
### Novidades
- Ficha PJ: Fichas são criadas com o modo de edição de perícias ligado.
- NPC: o botão Editar altera a ficha sem abrir uma segunda janela.
- Ameaças: Visão adicionada a todas as ameaças.

## Versão 1.1.47
### Novidades
- Poções: Novas cores para Óleos e Granadas
- Mais ícones para itens.

### Consertos de Bugs
- Ameaças: É possível puxar ameaças do compêndio novamente.

## Versão 1.1.46
### Novidades
- As seguintes magias foram atualizadas: Adaga Mental, Amarras Etéreas, Anular a Luz, Controlar Fogo, Controlar Madeira, Legião, Roubar a Alma, Santuário e Transmutar Objetos.
- As seguintes condições foram atualizadas: Enjoado e Sangrando.
- Magias: Aprimoramento de 12 PM da magia Augúrio adicionado.
- Magias e Poderes: Nomes de magias agora estão em itálico.
- Poderes: Pré-requisitos agora estão em itálico.

## Versão 1.1.45
### Novidades
- Ameaças: Nomes de algumas criaturas trocados para versões OGL: Arauto dos Goblinóides, Sombra dos Goblinóides, Cultista da Traição, Supremacistas (Recruta, Soldado, e Cavaleiro) , Lobo-Crocodilo, Aberrantes (Formiga, Formiga Maior, Besouro e Assassino).
- Ameaças: 3 variantes de Troll adicionadas.

### Consertos de Bugs
- Deletar uma armadura ou escudo equipado atualiza a Defesa corretamente.

## Versão 1.1.44
### Novidades
- Novos ícones para vários itens.

## Versão 1.1.43
### Consertos de Bugs
- Propriedades adicionadas à Katana.

## Versão 1.1.42
### Consertos de Bugs
- Equipamentos que não eram armaduras leves/pesadas ou escudos não removiam seu bônus ao serem deletados.
- Poções: Preços estão no lugar certo, não no custo em PM.
- Armas: Atributo pode ser selecionado em armas de NPCs.
- Maça de guerra, Cajado de batalha e batata ambiciosa movidos de volta para o compêndio de Equipamentos.

## Versão 1.1.41
### Consertos de Bugs
- Armaduras: Enquanto equipado com uma armadura natural ou traje, equipar outro do mesmo tipo não subtraía o bônus do item desequipado.
- Armaduras: Personagens podem equipar mais de uma Armadura Natural (exemplo: Couro Rígido e Casca Grossa).
- Poderes: Inspirar Glória (poder de Nobre) adicionado.
- Nome de alguns poderes consertados.

## Versão 1.1.40
### Consertos de Bugs
- Armas: O atributo certo será adicionado à rolagem de ataque.
- Ícones da Língua do Deserto e Baluarte Anão aparecem normalmente.
- Poções: Preços adicionados.

## Versão 1.1.39
### Novidades
- Novos ícones para Equipamentos.

## Versão 1.1.38
### Novidades
- Compêndio: Poções adicionadas.
- Compêndio: Itens Mágicos separados dos Equipamentos.
- Ficha PJ: Fonte do Deslocamento aumentada.
- ~~Novos ícones para Equipamentos.~~

### Consertos de Bugs
- Chat: A descrição de Consumíveis aparece normalmente.
- A magia Chuva de Meteoro causa o dano corretamente (10d6 + 10d6 de dano em vez de 20d6).
- Navegador de Compêndio: filtros de Execução das magias e de Subtipo de poderes consertado.
- Compêndio: Alguns escudos estavam configurados como Armaduras em vez de Escudos.
- Compêndio: Gema Elemental adicionada.
- Ficha NPC: Deslocamento de Voo aparece corretamente em vez de mostrar o deslocamento normal.

## Versão 1.1.37
### Novidades
- Adicionado Menu de Deslocamento. Agora é possível adicionar outros tipos de deslocamento às fichas. NPCs ficarão com um campo "Deslocamento (Antigo)" até que a informação seja apagada.
- Compêndio de Perícias. Passe o mouse do lado direito do nome de uma perícia e um ícone de livro aparecerá, clicar nele abrirá a entrada de diário com as informações da perícia.
- Itens, magias e poderes não têm mais hífens no meio das palavras.
- Suporte ao módulo Drag Ruler adicionado.

### Consertos de Bugs
- A magia Sopro das Montanhas Gélidas agora tem rolagem de dano.
- Aprimoramentos da magia Luz consertados.

## Versão 1.1.36
### Consertos de Bugs
- Caixas de descrição vazias (por exemplo, de itens recém-criados) podem ser editadas.

## Versão 1.1.35
### Consertos de Bugs
- Personagens com Bônus de PV/PM não definidos conseguem arrastar classes para a ficha.
- As caixas de seleção de Atributos nas configurações de nível não se remarcam após serem desmarcadas.

## Versão 1.1.34
### Novidades
- Favoritos adicionados à ficha de abas. Clique na estrela em um item, poder ou magia e ela aparecerá na aba Atributos.
- Automatização dos PV/PM. Adicionar/remover uma classe irá mudar os PV e PM do personagem. A primeira classe adicionada será considerada como o primeiro nível para cálculos de PV. Detalhe: alterar o valor `Níveis de Classe` dentro de uma Classe não irá alterar os valores.
- Clicar no Nível abre um menu para adicionar PV e PM extras. Detalhe: a habilidade do Anão, Duro como Pedra, deve ser adicionada como Bônus Total 2 e Bônus por Nível 1 para calcular corretamente.
- Adicionados mais idiomas do TRPG à lista de idiomas.
- Biografia e Diário unificados.
- Opção para o Mestre desabilitar o Diário (somente a biografia aparecerá).
- Melhorias visuais gerais.
- NPC: Idiomas e Dinheiro podem ser adicionados à ficha.
- Armas: Atributos podem ser escolhidos para a rolagem das armas, independente do atributo da Perícia escolhida. Detalhe: Sempre foi possível adicionar outros atributos adicionando `@for/des/con/int/sab/car` como Bônus.
- Armas: Atributos e Perícias não aparecem para NPCs. Mudança provisória.
- Compêndio: Armas como mordidas, garras, etc agora são consideradas armas naturais.
- Compêndio: Magia Preparação de Batalha atualizada.

### Consertos de Bugs
- Editar uma descrição não irá fazer com que o texto desapareça.
- As perícias das Classes podem ser selecionadas pelos jogadores.

## Versão 1.1.33
### Novidades
- As perícias das Classes podem ser modificadas pelo Mestre.
- Novas Configurações de Personagem adicionadas (menu de engrenagens na ficha do Personagem).
- BUG: As perícias das Classes não podem ser selecionadas.

## Versão 1.1.32
### Novidades
- Adicionadas Classes. Vá nos Pacotes de Compêndio e adicione uma classe ao seu personagem.
