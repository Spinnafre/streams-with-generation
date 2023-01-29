# Sobre CORS
## O que significa?
CORS é nada mais do que uma abreviação para Cross-Origin Resource Sharing, que é uma mecanismo baseado em um header HTTP que permite que os navegadores web consigam acesso a recursos de domínios ao redor da internet. Por meio dos CORS é possível fazer com que uma aplicação web que está rodando em uma determinada origem consiga acesso de forma segura e simples aos servidores que estão rodando em outra origem com permissões estabelecidas.

***Preflight requests*** é usado para o servidor enviar de volta para o cliente informações
sobre como é a sua comunicação com o mundo externo, explicitando quais métodos
e a partir de qual URL o cliente pode se comunicar com o servidor de forma segura.

É considerada uma medida de segurança para evitar ataques como [cross-site request forgery](https://developer.mozilla.org/en-US/docs/Glossary/CSRF)(**CSRFR**), permitindo comunicações somente de uma mesma origem com o servidor.

Uma origem é composta por ```protocolo + host + port```, como explicitado abaixo:

```https://foo.example:80```

Geralmente o browser realizar o **preflight** quando pretende realizar alguma operação que pode ocasionar alguma modificação no servidor.

Por exemplo:

Se o browser passar algum **Content-Type** na requisição em um método POST ou PUT,
irá realizar a requisição **OPTIONS** antes no servidor para ver se a url que está tentando
junto com o método que também irá enviar bate com o que o servidor permite. No caso do browser
irá fazer isso por baixo dos pano comparando a url retornada nos headers da requisição OPTIONS
com a url origem do browser, se for diferente então irá emitir um erro de CORS. Caso contrário
irá permitir realizar de fato a requisição desejada pelo o cliente para o servidor.
## Exemplo
```js
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "*",
  "Access-Control-Max-Age": 60 * 60 * 24 * 30,
};

http
  .createServer(async (request, response) => {

    if (request.method === "OPTIONS") {

      response.writeHead(204, headers);
      response.end();
      return;
    }

    if (["GET", "POST"].includes(request.method)) {
      response.writeHead(200, headers);
    }
    //...
```