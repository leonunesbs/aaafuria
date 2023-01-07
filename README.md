# @aaafuria

Este é um projeto construído com [Next.js](https://nextjs.org).

## Começando

Clone este repositório:

```
git clone https://github.com/leonunesbs/aaafuria.git
```

Instale as dependências:

```
pnpm install
```

Inicie o servidor de desenvolvimento:

```
pnpm dev
```

## Estrutura do projeto

```
📦src
 ┣ 📂components -> Componentes React
 ┃ ┣ 📂atoms -> Componentes mais básicos, como botões, inputs, etc.
 ┃ ┣ 📂molecules -> Componentes compostos por átomos, como cards, menus, etc.
 ┃ ┣ 📂organisms -> Componentes compostos por moléculas, como formulários, etc.
 ┃ ┗ 📂templates -> Componentes de UI.
 ┣ 📂contexts
 ┃ ┣ 📜ColorContext.tsx
 ┃ ┗ 📜index.tsx
 ┣ 📂libs -> Bibliotecas
 ┃ ┗ 📜functions.ts
 ┣ 📂pages -> Páginas Next.js
 ┃ ┣ 📂admin
 ┃ ┣ 📂api -> API do Next.js
 ┃ ┃ ┣ 📂auth
 ┃ ┃ ┃ ┗ 📜[...nextauth].ts
 ┃ ┃ ┣ 📂trpc
 ┃ ┃ ┃ ┗ 📜[trpc].ts
 ┃ ┣ 📂auth
 ┃ ┣ 📂dashboard
 ┃ ┣ 📂payments
 ┃ ┣ 📂store
 ┃ ┣ 📜403.tsx
 ┃ ┣ 📜404.tsx
 ┃ ┣ 📜_app.tsx
 ┃ ┣ 📜_document.tsx
 ┃ ┣ 📜activities.tsx
 ┃ ┣ 📜index.tsx
 ┃ ┣ 📜privacy.tsx
 ┃ ┣ 📜sejasocio.tsx
 ┃ ┗ 📜terms.tsx
 ┣ 📂server
 ┃ ┣ 📂routers 
 ┃ ┣ 📜context.ts 
 ┃ ┣ 📜prisma.ts
 ┃ ┗ 📜trpc.ts
 ┣ 📂styles
 ┃ ┗ 📂theme -> Estilos do Chakra UI
 ┃ ┃ ┣ 📂components -> Estilos dos componentes do Chakra UI
 ┃ ┃ ┣ 📂foundations -> Estilos das cores, fontes, etc.
 ┃ ┃ ┣ 📜index.ts -> Override dos estilos do Chakra
 ┃ ┃ ┗ 📜styles.ts -> Exportação dos estilos globais
 ┣ 📂types
 ┣ 📂utils
 ┃ ┗ 📜trpc.ts -> Configurações do tRPC
 ┗ 📜middleware.ts -> Middleware do Next.js
```

## Contribuindo

Se você deseja contribuir com este projeto, leia o arquivo [CONTRIBUTING.md](https://github.com/leonunesbs/aaafuria/CONTRIBUTING.md) para obter orientações.

## Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE.md](https://github.com/leonunesbs/aaafuria/blob/main/LICENSE.md) para mais detalhes.
