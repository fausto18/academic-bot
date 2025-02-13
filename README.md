# Academic Bot - Revisão de Trabalhos Acadêmicos

**Academic Bot** É uma aplicação que revisa trabalhos acadêmicos, identificando erros ortográficos
parágrafos mal elaborados, qualidade da introdução, alinhamento entre objetivos e resultados e coerência das conclusões.

---

## Tecnologias Utilizadas

- **Backend:** Node.js, Express.js, OpenAI API, pdf-parse, Multer, dotenv, winston
- **Frontend:** React.js, axios, react-scripts, web-vitals
- **Desktop:** Electron.js (planejado para versões futuras)

---

## Instalação e Configuração

### 1. Clonando o Repositório

```bash
git clone https://github.com/@fausto18/academic-bot.git
cd academic-bot
2. Configuração do Backend
Instalar Dependências
Navegue até a pasta do backend e instale as dependências:

cd backend
npm install
Configurar Variáveis de Ambiente
Crie um arquivo .env na pasta backend com o seguinte conteúdo:

OPENAI_API_KEY=SUA_CHAVE_DA_OPENAI_AQUI
PORT=5000
Rodar o Servidor
Inicie o servidor:

npm start
O backend será executado em: http://localhost:5000.

3. Configuração do Frontend
Instalar Dependências
Navegue até a pasta do frontend e instale as dependências:

cd ../frontend
npm install
Rodar o Frontend
Inicie a aplicação React:

npm start
O frontend será acessível em: http://localhost:3000.

Uso da Aplicação
Acesse o frontend através do navegador.
Faça o upload de um arquivo PDF contendo o trabalho acadêmico.
O sistema processará o PDF e retornará um relatório com:
Texto extraído
Erros ortográficos e sugestões de correção
Análise dos parágrafos mal elaborados
Seção de Introdução e sugestões de melhoria
Seção de Objetivos e Resultados
Avaliação de convergência entre objetivos e resultados
Seção de Conclusão e análise de metas e conclusões via chat completions
Endpoints da API
Upload de PDF
Rota: POST /upload
Parâmetros:
file: Arquivo PDF enviado via FormData.
Resposta: JSON contendo os resultados da análise.
Exemplo de resposta:

json
{
  "textoExtraido": "Conteúdo do PDF...",
  "errosOrtograficos": "Sugestões de correção...",
  "paragrafosMalElaborados": "Análise dos parágrafos...",
  "introducao": "Trecho da Introdução...",
  "sugestoesIntroducao": "Sugestões para melhorar a Introdução...",
  "objetivos": "Texto da seção Objetivos...",
  "resultados": "Texto da seção Resultados...",
  "avaliacaoConvergencia": "Análise entre objetivos e resultados...",
  "conclusao": "Texto da seção Conclusão...",
  "avaliacaoMetasConclusoes": "Análise das metas e conclusões..."
}
Possíveis Erros e Soluções
Erro	Causa Possível	Solução
429 - Too Many Requests	Muitas requisições para a API OpenAI em curto período	Reduza a frequência das chamadas ou verifique os limites da sua API
404 - Not Found	Modelo ou endpoint incorreto na API OpenAI	Verifique se o modelo especificado está disponível para sua conta
Erro ao processar o PDF	Arquivo corrompido ou problemas com pdf-parse	Certifique-se de enviar um PDF válido e, se necessário, atualize a versão do pdf-parse
Missing Dependencies (ex: web-vitals)	Dependência não instalada	Execute npm install na pasta do projeto correspondente (frontend ou backend)

#Licença
Este projeto está licenciado sob a MIT License.

Desenvolvido por Metanoia em colaboração com Phd.Eng. Analcisio Rodino
