# 🎲 RandomGroup

**Juntos, por acaso.**

Aplicação para juntar pessoas, distribuir ideias e organizar jogos sem favoritismos.

Uma página de cinco cards: **Grupos**, **Ordem**, **Temas**, **Com critérios** e **Mata-mata**. Cada sorteio é uma jornada: participantes → preferências → revisão → revelação animada. Não há sidebar, painel de gestão, contas ou formulários todos abertos ao mesmo tempo.

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
6. **Guarde:** descarregue os resultados em PDF ou PNG, com logo, QR code do app e assinatura. Listas grandes em PNG são divididas em imagens num ZIP.

Em todos os modos, **Partilhar resultados** permite preparar PDF ou PNG e abrir a partilha do dispositivo. Quando o navegador não suporta partilha de ficheiros, pode descarregar e enviar pela aplicação que preferir. O mata-mata mantém também o acesso protegido por senha e QR code.

Antes de enviar, o popup mostra a pré-visualização do ficheiro real, incluindo logo, QR code e assinatura. Pode navegar entre páginas do PDF ou imagens PNG, ampliar para conferir os detalhes e abrir o ficheiro completo. A partilha é activada depois de carregar a pré-visualização.

Alterne directamente entre **PDF** e **PNG** no topo da pré-visualização. Os ficheiros preparados são reutilizados enquanto o popup estiver aberto. No telemóvel, toque duas vezes para ampliar e novamente para voltar ao tamanho normal, tanto no popup como em tela inteira. Também pode afastar ou aproximar dois dedos para ampliar ou reduzir e arraste com um dedo para explorar os nomes e o rodapé; o botão de ajuste repõe a vista completa.

Use **Abrir em tela inteira** para aproveitar todo o ecrã, mantendo os formatos, as páginas e os gestos de zoom. Usa a tela inteira nativa quando disponível e ocupa a área da página nos restantes navegadores. **Sair da tela inteira** ou Escape regressa ao popup sem fechar os resultados.

Ao entrar no site, um aviso permite instalar a aplicação ou fechar para continuar. O aviso volta numa nova visita e fica oculto quando a aplicação é aberta em modo instalado. Ao entrar no site, no desktop ou no telemóvel, e ao abrir o app instalado, um ecrã de carregamento de pelo menos **5 segundos** mostra o símbolo a rodar à esquerda de **RandomGroup.**, com entrada animada do nome. A abertura desaparece depois desse tempo, quando a interface está pronta. O logo do app roda três voltas durante 6 segundos e depois pára, mantendo o tamanho no telemóvel; a preferência de movimento reduzido é respeitada.

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

## Autor e contacto

**Aquilivio Maria Cumbe** · Inhambane, Moçambique.

- [WhatsApp](https://wa.me/258874544510)
- [GitHub](https://github.com/Aquilivio)
- [LinkedIn](https://www.linkedin.com/in/aquilivio-maria-cumbe-b2a890289/)

Projecto original: [randteam.vercel.app](https://randteam.vercel.app).

Evolução do projeto [RandTeam](https://github.com/Aquilivio/RandTeam_Sorteio_Inteligente).

Os participantes do Mata-mata recebem ícones e cores variados em cada novo torneio. Toque num ícone para escolher outro símbolo e cor e prima **Guardar**. A escolha fica no participante, incluindo na cópia local, no acesso com senha e nos mapas PDF/PNG. A identidade de cada participante mantém-se ao avançar, reabrir ou partilhar o torneio e nas exportações.
