import http from "node:http";

import { randomUUID } from "node:crypto";
import { Readable, PassThrough } from "node:stream";
import { setTimeout } from "node:timers/promises";
import { pipeline } from "node:stream/promises";

const port = 3000;

async function* run() {
  for (let i = 0; i < 100; i++) {
    await setTimeout(500);
    const data = {
      _id: randomUUID(),
      position: i,
      content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure 
        dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non 
        proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
      created_at: new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "full",
      }).format(Date.now()),
    };
    yield JSON.stringify(data).concat("\n");
  }
}

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

    try {
      const generation = run();

      request.once("close", () => console.log("Client has disconnected"));

      const passThrough = new PassThrough();

      passThrough.on("error", (error) => {
        console.log("Has encountered an error in stream : ", error);
      });

      const readable = Readable.from(generation);

      await pipeline(readable, passThrough, response);

      console.log("Stream succeeded :)");
    } catch (error) {
      if (error.code === "ERR_STREAM_PREMATURE_CLOSE") {
        console.log("Client cancelou a streaming de dados");
      }
    }
  })
  .listen(port)
  .on("listening", () => {
    console.log("Server listening in port 3000");
  })
  .on("error", (error) => {
    console.log(error);
  });
