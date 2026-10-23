# 🎲 RandomGroup

**Juntos, por acaso.**

Aplicação para juntar pessoas, distribuir ideias e organizar jogos sem favoritismos. Criada por **Aquilivio Maria Cumbe**, em Inhambane, Moçambique, como evolução do RandTeam.

Uma página simples de cinco cards: **Grupos**, **Ordem**, **Temas**, **Com critérios** e **Mata-mata**. Cada sorteio é uma jornada: participantes → preferências → revisão → revelação animada. Não há sidebar, painel de gestão, contas ou formulários todos abertos ao mesmo tempo.

## 🌟 Por que criei o RandomGroup?

Sou o representante da minha turma e, muitas vezes, fico encarregado de formar grupos para trabalhos e actividades. Quando fazia isso manualmente, alguns colegas pediam para ficar com os amigos; outros achavam que eu estava a favorecer alguém. Isso gerava conflitos e tornava uma tarefa simples muito desgastante.

Queria uma forma de resolver a situação sem preferências pessoais, em que todos tivessem a mesma oportunidade de participar. Foi assim que nasceu o **RandTeam**: deixar o acaso formar as equipas e distribuir os temas, de forma transparente.

O **RandomGroup** é a evolução dessa ideia. Mantém o que motivou o projecto — juntar pessoas sem favoritismos — e acrescenta sorteios de ordem, critérios personalizados e um mapa de torneios. O objectivo é que eu, os meus colegas e qualquer pessoa possam dedicar mais tempo à actividade e menos tempo a discutir a divisão dos grupos.

De **Aquilivio Maria Cumbe**, Inhambane, Moçambique.

## 🎯 Como funciona?

1. **Escolha o modo:** grupos, ordem, temas, critérios ou mata-mata.
2. **Adicione os dados:** escreva os nomes, cole uma lista ou importe um documento. Os campos começam vazios, com placeholders; o botão **Usar exemplo** é opcional.
3. **Defina as preferências:** quantidade de grupos, temas, quotas ou modo de decisão dos jogos, conforme o sorteio escolhido.
4. **Reveja:** a aplicação verifica nomes repetidos, limites e regras impossíveis antes do sorteio.
5. **Acompanhe:** os resultados aparecem com animações, um nome por vez. Pode acelerar ou mostrar tudo.
6. **Guarde:** descarregue o relatório em PDF com a assinatura do criador em todas as páginas.

## 🔥 Por que usar?

- **Transparência:** acompanhe a formação dos grupos e a progressão dos jogos.
- **Imparcialidade:** o embaralhamento usa aleatoriedade do navegador, sem escolhas pessoais. Uma distribuição aleatória não garante equipas de igual habilidade; para necessidades específicas, use critérios.
- **Facilidade:** uma etapa de cada vez, texto legível e apenas os campos necessários.
- **Flexibilidade:** cursos, género, turnos, apresentações, trabalhos e competições.
- **Praticidade:** listas importadas, relatórios PDF e instalação no telemóvel.

## Executar

Requer **Node.js 22.13+** (ou uma versão posterior suportada; desenvolvido com Node 24) e npm.

```sh
npm ci
npm run dev
```

Abra o endereço indicado pelo Vite, normalmente `http://127.0.0.1:5173`.

```sh
npm test          # regras de distribuição, quotas e progressão dos jogos
npm run build    # produção, na pasta dist
npm run preview  # servir a compilação localmente
```

## Experiência e identidade

- Nome: **RandomGroup**. Slogan: **Juntos, por acaso.**
- Topo com marca, slogan e botão Sobre. Rodapé com WhatsApp, GitHub e LinkedIn do criador.
- Fundo branco, texto escuro e acentos em azul, verde, vermelho, violeta e ocre. Os ícones e a tipografia acompanham a função de cada modo.
- Cinco cards maiores na horizontal em desktop; duas colunas em tablet; cards empilhados e adaptados na vertical em telemóvel. **Com critérios** e **Mata-mata** têm a etiqueta **Novo**. A página inicial vai directamente à escolha do sorteio, sem bloco promocional.
- Uma etapa por vez, com indicador de progresso e botões Voltar/Continuar. A revisão permite conferir os números antes de sortear.
- Animações de entrada, mudanças de etapa, hover, ícones, progresso e revelação dos participantes. As preferências de movimento reduzido do sistema são respeitadas.
- No resultado, os nomes aparecem um de cada vez, alternando entre os grupos. É possível acelerar ou mostrar tudo imediatamente.
- Os relatórios são descarregados diretamente em PDF; não há exportação ou importação JSON na interface.
- O **Sobre** apresenta perguntas numa lista vertical. Ao abrir uma resposta, a anterior fecha. A história do projecto, os cinco modos e a instalação ficam disponíveis sem carrossel ou ícones decorativos.
- A pergunta inicial **O que vamos sortear hoje?** é pequena e centralizada.

## Modos de sorteio

### Grupos

1. Cole os nomes ou importe um documento.
2. Escolha quantos grupos quer criar.
3. Reveja e faça o sorteio.

Todos os participantes aparecem exatamente uma vez; os tamanhos dos grupos diferem no máximo em uma pessoa. Entre 2 e 500 participantes, com 1 até o total de participantes em grupos.

### Ordem

Introduza os nomes, reveja e sorteie. Cada pessoa recebe uma posição única. Útil para apresentações, jogos, filas e tarefas. Entre 2 e 500 participantes.

### Temas

Há duas formas: **Formar grupos e sortear temas** recebe uma lista de participantes e a quantidade de grupos, formando equipas equilibradas; **Os grupos já existem** permite registar o nome e os membros de cada grupo, um grupo de cada vez, mantendo essas pessoas juntas. Nessa opção, a quantidade de grupos é calculada automaticamente. Adicione os temas, um por linha. Cada grupo recebe um tema diferente, escolhido ao acaso. Deve haver pelo menos tantos temas como grupos. Os temas excedentes não são atribuídos. Até 500 participantes e 500 temas; nomes repetidos entre grupos são rejeitados.

### Com critérios

O critério é uma característica que organiza os participantes: **Curso**, **Género**, **Nível**, **Turno** ou outra definida pelo utilizador. Cada sorteio configura um critério e até 12 categorias; pode realizar novos sorteios com outras características.

A jornada é:

1. **Critério:** dê um nome à característica e às suas categorias. Existem atalhos para cursos, mulheres/homens e personalização.
2. **Participantes:** introduza os nomes de uma categoria de cada vez. Por exemplo, primeiro os estudantes de TEO, depois os de EIT e depois os de Agro.
3. **Regras:** defina o número de grupos e escolha misturar ou separar.
4. **Revisão:** confira participantes, categorias e quotas antes de sortear.

Uma pessoa deve pertencer a uma única categoria no sorteio. Nomes repetidos entre categorias são rejeitados; use apelido ou identificador para distinguir pessoas com o mesmo nome.

**Misturar categorias:** pode definir, para cada categoria, uma quota **Pelo menos** ou **Exatamente** por grupo. Em branco, a quota mínima é zero e a distribuição procura o equilíbrio. As quotas mínimas são atribuídas primeiro; as pessoas restantes são distribuídas por categoria, equilibrando os tamanhos. Todos participam.

### 📌 Exemplo: cursos numa turma

| Categoria | Participantes | Regra por grupo |
| --------- | ------------: | --------------- |
| TEO       |             5 | Exatamente 1    |
| Agro      |             5 | Exatamente 1    |
| EIT       |            15 | Exatamente 3    |

Escolhendo **5 grupos**, cada grupo terá 5 pessoas: 1 de TEO, 1 de Agro e 3 de EIT.

Para ter **pelo menos uma mulher em cada grupo**, crie Mulheres e Homens, introduza os nomes separadamente, escolha o total de grupos e coloque `Pelo menos 1` em Mulheres. Deixe Homens em automático. A mesma regra funciona ao contrário.

Uma quota impossível é rejeitada com a quantidade necessária e disponível. Por exemplo, 4 mulheres não conseguem preencher 5 grupos com uma mulher por grupo. Uma quota exata também rejeita excedentes: 6 mulheres para 5 grupos com exatamente 1 exige alterar a lista ou usar a regra mínima. O programa nunca ignora participantes para simular o cumprimento da regra.

**Separar categorias:** cada grupo tem pessoas de uma única categoria. Se escolher Curso, um grupo só terá estudantes de TEO, outro de EIT, etc. É necessário pelo menos um grupo por categoria. O total solicitado é repartido proporcionalmente entre as categorias; os tamanhos são equilibrados dentro de cada categoria e podem variar entre categorias.

### Mata-mata

Entre 2 e 128 pessoas ou equipas. Dê um nome ao torneio e escolha:

- **Com resultados:** preencha o placar dos dois participantes. Se A fizer 5 e B fizer 2, A avança automaticamente. Os resultados devem ser inteiros de 0 a 999. Empates não classificam ninguém; indique o resultado após desempate.
- **Escolher vencedor:** clique na pessoa ou equipa que deve avançar.

O mapa mostra dois lados que convergem para a final ao centro. Usa cards com ícones e cores próprios para cada participante, sem tabelas. Os símbolos acompanham as pessoas ou equipas entre fases. Setas curvas ligam os confrontos reais, como um mapa mental; os caminhos concluídos são animados. Quem avança recebe fundo verde, visto e maior destaque no ícone e no nome. Quem perde fica com fundo avermelhado, nome riscado e um X grande no ícone. Em telemóveis, o quadro tem deslocamento horizontal interno para manter os confrontos legíveis.

Os participantes são misturados no início. Quantidades ímpares têm uma passagem direta na fase em que falta adversário, sem inventar participantes para preencher o quadro. Exemplo: 5 → 3 → 2 → campeão. Os nomes das fases acompanham os participantes restantes.

É possível corrigir resultados e desfazer até 30 alterações na sessão. Uma correção elimina os resultados posteriores que dependiam do vencedor alterado e conserva os confrontos independentes. Se o placar ficar vazio ou empatado durante a edição, o vencedor anterior é retirado.

O torneio atual é guardado automaticamente em `localStorage`, na chave `randomgroup.tournament.v2`. A página inicial apresenta **Continuar** quando existe um torneio guardado. A cópia antiga de `randgroup.tournament.v1` é lida para compatibilidade. Resultados, participantes e modo de decisão são retomados; o histórico de desfazer existe apenas na sessão.

Ao criar um novo torneio, a cópia local anterior é substituída. O armazenamento é por origem e navegador; não sincroniza dispositivos. Limpar os dados do site, mudar de domínio, usar navegação privada ou armazenamento bloqueado pode perder essa cópia. O mapa em PNG/PDF é um relatório para partilha. Para recuperar e editar uma cópia noutro dispositivo, gere um acesso protegido por senha, descrito abaixo.

## 🔐 Voltar ao torneio com senha, link ou QR code

O projecto continua a ser **inteiramente estático**, compatível com **GitHub Pages** e **Vercel**, sem servidor, contas ou base de dados.

O JavaScript executado no navegador não grava ficheiros no código publicado, no GitHub ou no alojamento. Para levar os resultados a outro computador sem servidor, o RandomGroup guarda uma **cópia encriptada do JSON dentro do link de acesso**. A senha nunca é incluída no link ou no QR code.

1. No mata-mata, clique em **Acesso com senha / QR**.
2. Defina e confirme uma senha com 8 a 128 caracteres.
3. Copie o link, descarregue o QR code ou escolha **Guardar acesso** para guardar um ficheiro `.rg`.
4. Abra o link/QR noutro dispositivo e introduza a senha. A cópia é validada, carregada e pode ser editada.
5. Para abrir um ficheiro `.rg` ou colar um link, use **Abrir torneio com link e senha** na página inicial.

**Cada acesso representa o estado no momento em que foi gerado.** Não existe sincronização entre dispositivos. Alterações posteriores só entram num **novo link/QR/ficheiro de acesso**. Duas pessoas que abram o mesmo link editam cópias independentes; nenhuma alteração substitui a cópia da outra pessoa.

A senha protege o conteúdo partilhado, não bloqueia o torneio que já está aberto ou guardado no próprio navegador. Ao abrir um acesso, a cópia carregada substitui o torneio local actual, como indicado no formulário.

### Protecção e limites

- JSON normalizado e validado antes de guardar e depois de abrir.
- Compressão Deflate quando suportada pelo navegador.
- Encriptação **AES-GCM de 256 bits**, com salt e IV aleatórios para cada acesso.
- Chave derivada da senha por **PBKDF2/SHA-256 com 250 000 iterações**.
- O acesso fica no fragmento `#torneio=…` da URL; o fragmento não é enviado ao alojamento na requisição da página.
- O ficheiro `.rg` contém o mesmo conteúdo encriptado, não JSON em texto simples.
- O QR code é gerado localmente. Se o link for demasiado grande para um QR, use o link completo ou o ficheiro `.rg`; não são usados encurtadores nem serviços externos.
- É preciso guardar a senha. Sem servidor nem conta, **não existe recuperação de senha**.
- A protecção por senha requer HTTPS (ou localhost para desenvolvimento). Utilize um navegador actualizado.

## Importar participantes e temas

Os campos de listas aceitam texto colado e ficheiros **PDF**, **DOCX**, **MD** e **TXT**, até **10 MB**. PDFs podem ter até 100 páginas. A importação acrescenta o texto à lista atual para permitir juntar várias fontes.

- Markdown/TXT: leitura como texto, retirando marcadores comuns de listas.
- DOCX: extração de texto com Mammoth, sem executar conteúdo do documento.
- PDF: extração da camada de texto com PDF.js e worker incluído na compilação.
- Um nome por linha; linhas vazias e espaços exteriores são removidos. Os nomes são comparados sem distinguir maiúsculas/minúsculas e com normalização Unicode.
- PDFs digitalizados sem camada de texto precisam de transcrição ou OCR externo. O RandomGroup não inclui OCR.
- Reveja sempre a lista extraída. Documentos com cabeçalhos, várias colunas ou tabelas podem precisar de ajustes manuais.
- Até 100 caracteres por nome. Use apelidos ou números para distinguir nomes iguais.

Os ficheiros são lidos no navegador. O conteúdo e os nomes não são enviados a serviços externos.

## Relatórios PDF

Nos sorteios de grupos, ordem, temas e critérios, **Descarregar PDF** gera um relatório compacto em A4: cards em **duas colunas**, dispostos em linhas, com tipografia menor e espaços reduzidos. São preservados os nomes completos, categorias e temas, com continuações quando um grupo não cabe num card.

**Descarregar PNG** guarda os próprios cards dos resultados numa imagem em duas colunas, com o logo, slogan, medalhas de classificação, temas, categorias e membros. O rodapé inclui data, assinatura e o QR code do app com a marca ao centro. A apresentação é consistente no computador e no telemóvel. Listas grandes são divididas em imagens numeradas, reunidas num único ZIP; grupos longos continuam no card seguinte sem perder membros. Cada imagem leva a identificação e o rodapé completos.

No **mata-mata**, a exportação é o **mapa completo**, incluindo os dois lados, as ligações, os placares e os estados de cada participante. Há duas opções: **Descarregar mapa PNG** e **Mapa em PDF horizontal**. O PDF usa uma página A3 horizontal, ajustando o mapa inteiro; não converte os confrontos numa lista. Para torneios grandes, prefira a imagem e amplie para ler os detalhes. A imagem é gerada com limite de resolução para evitar exceder os limites de memória do navegador, mantendo data e assinatura.

A paginação divide listas longas em continuações e reserva o rodapé em todas as páginas. O rodapé inclui a data/hora de emissão (Moçambique), paginação e a assinatura original do RandTeam:

> Created & Designed by Aquilivio Maria

Junto da assinatura, os PDFs e PNGs incluem um QR code compacto para **https://randomgroup.vercel.app**, com o símbolo e o nome RandomGroup ao centro. No PDF, o QR também é clicável. O QR usa correcção de erros alta para preservar a leitura com a marca sobreposta.

Os ficheiros exportados usam a marca do site: símbolo de três círculos, **RandomGroup.**, separador vertical e **Juntos, por acaso.** Os cards mantêm a faixa de cor, iniciais e vistos dos resultados. Na ordem de apresentação, os três primeiros lugares recebem medalhas de ouro, prata e bronze; os restantes usam posições numeradas em azul, tanto no ecrã como no PDF.

A fonte Carlito, regular e negrito, é incorporada no ficheiro para preservar os acentos e a leitura em outros dispositivos. Os PDFs não dependem da caixa de impressão do navegador.

## Privacidade e funcionamento

Sem backend, contas ou base de dados. Aleatoriedade por **Fisher–Yates**, alimentada por `crypto.getRandomValues` com rejeição para evitar viés na escolha de índices. Os cálculos são locais.

Só o torneio tem persistência automática; os restantes formulários e resultados permanecem em memória e são reiniciados ao sair do sorteio ou recarregar a página. Guarde o PDF antes de sair se precisar do resultado.

As fontes opcionais da interface são carregadas do Google Fonts com alternativas locais. O service worker guarda a aplicação e os seus recursos, incluindo as bibliotecas de leitura, o worker de PDF e a fonte do relatório. Depois do primeiro carregamento completo e da activação do cache, esses recursos funcionam offline. Sem rede, as fontes externas opcionais podem usar a alternativa local.

## 📱 Instalar como aplicação (PWA)

O RandomGroup inclui manifesto web, ícones de 192 e 512 px, ícone maskable, ícone para iPhone e service worker gerado pelo `vite-plugin-pwa`.

- **Android / navegadores compatíveis:** quando o navegador disponibilizar a instalação, aparece o botão **Instalar** no topo. Também pode usar a opção de instalar aplicação no menu do navegador.
- **iPhone / iPad:** abra no Safari e escolha **Partilhar → Adicionar ao ecrã principal**. O botão da aplicação mostra essas instruções.
- **Computador:** use o botão de instalação quando disponível ou a opção do navegador.
- A aplicação instalada abre numa janela própria, com a marca e as cores do RandomGroup.

A instalação depende do navegador e exige **HTTPS em produção**. `localhost` e `127.0.0.1` são adequados para testar a versão compilada. Abrir um endereço HTTP da rede local no telemóvel não equivale a um alojamento HTTPS.

### Offline e actualizações

Após uma primeira visita com rede, aguarde a conclusão da instalação do service worker. Ele guarda o HTML, CSS, JavaScript, ícones, fonte do PDF e bibliotecas para permitir novos sorteios, leitura local de documentos e geração de relatórios sem ligação. O cache não é uma cópia de segurança dos resultados. Os limites e a persistência do torneio continuam a ser os descritos acima.

Uma nova versão apresenta **Actualizar**. Pode adiar a actualização para acabar o sorteio actual; ao aceitar, a página recarrega. Os formulários em memória podem ser reiniciados, enquanto o torneio guardado permanece no armazenamento local. O navegador pode remover dados e caches por falta de espaço ou nas suas definições.

O PWA é gerado em produção, não no servidor de desenvolvimento. Para testar:

```sh
npm run build
npm run preview
```

Abra o endereço indicado, instale ou espere pelo registo do service worker, recarregue e teste sem rede. A configuração usa caminhos relativos para funcionar também num subdirectório como `/RandomGroup/`.

## Tecnologias e estrutura

React 19, Vite 7, vite-plugin-pwa/Workbox, Lucide React, jsPDF, PDF.js, Mammoth, html-to-image e qrcode. A protecção dos acessos usa a Web Crypto API do navegador. CSS responsivo e animações nativas; sem framework de dashboard.

```text
src/
  main.jsx                 Página inicial, jornadas, resultados, torneio e Sobre
  styles.css               Marca, layout, responsividade e animações
  engine.js                Aleatoriedade, grupos, quotas e progressão de torneios
  pwa.jsx                  Instalação e aviso de actualização da PWA
  imports.js               Leitura local e limpeza do texto importado
  report.js                Relatórios PDF compactos em duas colunas
  map-export.js            Exportação do mapa completo em PNG/PDF horizontal
  access.js                Compressão, encriptação e leitura dos acessos
  ShareDialog.jsx          Senha, QR code, link e recuperação de cópias
  assets/report-font.ttf   Carlito para os relatórios
public/                    Favicon e ícones de instalação
vite.config.js             Compilação, manifesto e cache offline
tests/                     Testes de distribuição, quotas e torneios
.github/workflows/         Compilação e publicação pelo GitHub Pages
```

## Publicar

1. Envie esta pasta como raiz de um repositório no GitHub.
2. Use a branch `main`.
3. Em **Settings → Pages → Build and deployment**, selecione **GitHub Actions**.
4. O workflow instala dependências, executa os testes, compila e publica `dist`.

`base: './'` permite servir o projeto num domínio próprio ou num subdiretório como `/RandomGroup/`. Também pode publicar o conteúdo de `dist` em qualquer alojamento estático. A interface não usa rotas que precisem de configuração especial no servidor. Os acessos partilhados usam o fragmento da URL, funcionando também no GitHub Pages. No Vercel, importe o repositório como projecto Vite, com `npm run build` e saída `dist`; não é necessário alojamento Node.js para executar a aplicação.

## Autor e contacto

**Aquilivio Maria Cumbe** · Inhambane, Moçambique.

- [WhatsApp](https://wa.me/258874544510)
- [GitHub](https://github.com/Aquilivio)
- [LinkedIn](https://www.linkedin.com/in/aquilivio-maria-cumbe-b2a890289/)

Projecto original: [randteam.vercel.app](https://randteam.vercel.app).

Evolução do projeto [RandTeam](https://github.com/Aquilivio/RandTeam_Sorteio_Inteligente).
